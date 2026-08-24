#!/usr/bin/env bash
set -euo pipefail

app_path="${1:-}"
if [[ -z "$app_path" || ! -d "$app_path" ]]; then
  echo "Usage: $0 /path/to/Astrofox.app" >&2
  exit 2
fi

: "${APPLE_ID:?APPLE_ID is required}"
: "${APPLE_APP_SPECIFIC_PASSWORD:?APPLE_APP_SPECIFIC_PASSWORD is required}"
: "${APPLE_TEAM_ID:?APPLE_TEAM_ID is required}"

log_dir="${MACOS_PACKAGE_LOG_DIR:-$PWD/macos-package-logs}"
mkdir -p "$log_dir"

notary_zip="${RUNNER_TEMP:-$PWD}/Astrofox-notarization.zip"
submit_json="$log_dir/notary-submit.json"
wait_json="$log_dir/notary-wait.json"
notary_log_json="$log_dir/notary-log.json"
stapler_log="$log_dir/stapler.log"
wait_timeout="${NOTARY_WAIT_TIMEOUT:-30m}"

auth_args=(
  --apple-id "$APPLE_ID"
  --password "$APPLE_APP_SPECIFIC_PASSWORD"
  --team-id "$APPLE_TEAM_ID"
)

json_value() {
  local file_path="$1"
  local field_name="$2"
  node -e '
    const fs = require("node:fs");
    const [filePath, fieldName] = process.argv.slice(1);
    try {
      const value = JSON.parse(fs.readFileSync(filePath, "utf8"))?.[fieldName];
      if (value != null) process.stdout.write(String(value));
    } catch {}
  ' "$file_path" "$field_name"
}

echo "::group::Create app notarization archive"
rm -f "$notary_zip" "$submit_json" "$wait_json" "$notary_log_json" "$stapler_log"
ditto -c -k --keepParent "$app_path" "$notary_zip"
du -sh "$notary_zip"
echo "::endgroup::"

echo "::group::Submit app to Apple notary service"
xcrun notarytool submit "$notary_zip" "${auth_args[@]}" --output-format json --no-progress | tee "$submit_json"
submission_id="$(json_value "$submit_json" id)"
if [[ -z "$submission_id" ]]; then
  echo "Could not read notary submission id from $submit_json" >&2
  exit 1
fi
echo "Notary submission id: $submission_id"
echo "::endgroup::"

echo "::group::Wait for notary result"
set +e
xcrun notarytool wait "$submission_id" "${auth_args[@]}" --timeout "$wait_timeout" --output-format json --no-progress | tee "$wait_json"
wait_status="${PIPESTATUS[0]}"
set -e

notary_status="$(json_value "$wait_json" status)"
echo "notarytool wait exit status: $wait_status"
echo "notary status: ${notary_status:-unknown}"
echo "::endgroup::"

if [[ "$wait_status" -ne 0 || "$notary_status" != "Accepted" ]]; then
  echo "::group::Fetch notary diagnostic log"
  xcrun notarytool log "$submission_id" "${auth_args[@]}" --output-format json | tee "$notary_log_json" || true
  echo "::endgroup::"
  exit 1
fi

echo "::group::Staple notarization ticket"
xcrun stapler staple "$app_path" 2>&1 | tee "$stapler_log"
xcrun stapler validate "$app_path" 2>&1 | tee -a "$stapler_log"
echo "::endgroup::"
