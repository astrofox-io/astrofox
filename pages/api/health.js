export default function healthHandler(_req, res) {
	res.status(200).json({ ok: true });
}
