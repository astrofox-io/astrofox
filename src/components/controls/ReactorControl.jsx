import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Control, Option, Label } from 'components/controls/Control';
import Icon from 'components/interface/Icon';
import {
    BoxInput,
    NumberInput,
    RangeInput,
    ButtonInput,
    ButtonGroup,
} from 'lib/inputs';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import iconLeft from 'svg/icons/chevron-left.svg';
import iconRight from 'svg/icons/chevron-right.svg';
import iconDown from 'svg/icons/chevron-down.svg';
import iconMinus from 'svg/icons/minus.svg';
import iconPlus from 'svg/icons/plus.svg';
import iconCircle from 'svg/icons/dots-three-horizontal.svg';
import styles from './ReactorControl.less';

const REACTOR_BARS = 64;

const outputOptions = [
    { title: 'Backwards', icon: iconLeft },
    { title: 'Forward', icon: iconRight },
    { title: 'Cycle Backwards', icon: iconMinus },
    { title: 'Cycle Forward', icon: iconPlus },
    { title: 'Cycle', icon: iconCircle },
];

export default class ReactorControl extends PureComponent {
    static defaultProps = {
        barWidth: 8,
        barHeight: 100,
        barSpacing: 1,
        reactor: null,
        visible: false,
    }

    componentDidMount() {
        const { barWidth, barHeight, barSpacing } = this.props;

        this.spectrum = new CanvasBars(
            {
                width: REACTOR_BARS * (barWidth + barSpacing),
                height: barHeight,
                barWidth,
                barSpacing,
                shadowHeight: 0,
                color: '#775FD8',
                backgroundColor: '#FF0000',
            },
            this.spectrumCanvas,
        );

        this.output = new CanvasMeter(
            {
                width: 20,
                height: barHeight,
                color: '#775FD8',
                origin: 'bottom',
            },
            this.outputCanvas,
        );

        events.on('render', this.draw, this);
    }

    componentWillUnmount() {
        events.off('render', this.draw, this);
    }

    onChange = (name, value) => {
        if (['selection', 'outputMode'].includes(name)) {
            this.updateReactor(name, value);
        }
        else {
            this.updateParser(name, value);
        }
    }

    draw = () => {
        const { reactor } = this.props;

        if (reactor) {
            const { fft, output } = reactor.getResult();

            this.spectrum.render(fft);
            this.output.render(output);
        }
    }

    updateReactor = (name, value) => {
        const {
            reactor,
            barWidth,
            barHeight,
            barSpacing,
        } = this.props;
        const obj = { [name]: value };

        if (name === 'selection') {
            const {
                x, y, width, height,
            } = value;
            const maxWidth = REACTOR_BARS * (barWidth + barSpacing);
            const maxHeight = barHeight;

            obj.range = {
                x1: x / maxWidth,
                x2: (x + width) / maxWidth,
                y1: y / maxHeight,
                y2: (y + height) / maxHeight,
            };
        }

        reactor.update(obj);

        this.forceUpdate();
    }

    updateParser = (name, value) => {
        const { reactor } = this.props;

        if (reactor) {
            reactor.parser.update({ [name]: value });
            this.forceUpdate();
        }
    }

    hideReactor = () => {
        events.emit('reactor-edit', null);
    }

    render() {
        const {
            reactor, barWidth, barHeight, barSpacing, visible,
        } = this.props;

        return (
            <div className={classNames({
                [styles.reactor]: true,
                [styles.hidden]: !visible,
            })}
            >
                <div className={styles.title}>
                    {
                        reactor &&
                        reactor.options.displayName
                    }
                </div>
                <div className={styles.display}>
                    <div className={styles.controls}>
                        <Controls
                            reactor={reactor}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className={styles.spectrum}>
                        <canvas
                            ref={e => (this.spectrumCanvas = e)}
                            width={REACTOR_BARS * (barWidth + barSpacing)}
                            height={barHeight}
                            onClick={this.onClick}
                        />
                        <BoxInput
                            ref={e => (this.box = e)}
                            name="selection"
                            value={reactor ? reactor.options.selection : {}}
                            minWidth={barWidth}
                            minHeight={barWidth}
                            maxWidth={REACTOR_BARS * (barWidth + barSpacing)}
                            maxHeight={barHeight}
                            onChange={this.onChange}
                        />
                    </div>
                    <div className={styles.output}>
                        <canvas
                            ref={e => (this.outputCanvas = e)}
                            width={20}
                            height={barHeight}
                        />
                    </div>
                </div>
                <Icon
                    className={styles.closeIcon}
                    glyph={iconDown}
                    title="Hide Panel"
                    onClick={this.hideReactor}
                />
            </div>
        );
    }
}

const Controls = ({ reactor, onChange }) => {
    const { maxDecibels, smoothingTimeConstant } = (reactor ? reactor.parser.options : {});
    const { outputMode } = (reactor ? reactor.options : {});

    return (
        <Control className={styles.control}>
            <Option className={styles.option}>
                <Label text="Output Mode" className={styles.label} />
                <ButtonGroup>
                    {
                        outputOptions.map((mode, index) => (
                            <ButtonInput
                                key={index}
                                icon={mode.icon}
                                title={mode.title}
                                active={outputMode === mode.title}
                                onClick={() => onChange('outputMode', mode.title)}
                            />
                        ))
                    }
                </ButtonGroup>
            </Option>
            <Option className={styles.option}>
                <Label text="Max dB" className={styles.label} />
                <NumberInput
                    name="maxDecibels"
                    value={maxDecibels}
                    className={styles.input}
                    width={40}
                    min={-40}
                    max={0}
                    step={1}
                    onChange={onChange}
                />
                <RangeInput
                    name="maxDecibels"
                    value={maxDecibels}
                    min={-40}
                    max={0}
                    step={1}
                    onChange={onChange}
                />
            </Option>
            <Option className={styles.option}>
                <Label text="Smoothing" className={styles.label} />
                <NumberInput
                    name="smoothingTimeConstant"
                    value={smoothingTimeConstant}
                    className={styles.input}
                    width={40}
                    min={0}
                    max={0.99}
                    step={0.01}
                    onChange={onChange}
                />
                <RangeInput
                    name="smoothingTimeConstant"
                    value={smoothingTimeConstant}
                    min={0}
                    max={0.99}
                    step={0.01}
                    onChange={onChange}
                />
            </Option>
        </Control>
    );
};

