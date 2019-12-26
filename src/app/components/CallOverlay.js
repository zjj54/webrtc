'use strict';

const React                   = require('react');
const PropTypes               = require('prop-types');
const TransitionGroup         = require('react-transition-group/TransitionGroup');
const CSSTransition           = require('react-transition-group/CSSTransition');
const classNames              = require('classnames');
const moment                  = require('moment');
const momentFormat            = require('moment-duration-format');


class CallOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.duration = null;
        this.timer = null;
        this._isMounted = true;

        // ES6 classes no longer autobind
        this.callStateChanged = this.callStateChanged.bind(this);
    }

    componentDidMount() {
        if (this.props.call) {
            if (this.props.call.state === 'established') {
                this.startTimer();
            } else if (this.props.call.state !== 'terminated') {
                this.props.call.on('stateChanged', this.callStateChanged);
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.call == null && nextProps.call) {
            if (nextProps.call.state === 'established') {
                this.startTimer();
            } else if (nextProps.call.state !== 'terminated') {
                nextProps.call.on('stateChanged', this.callStateChanged);
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        clearTimeout(this.timer);
    }

    callStateChanged(oldState, newState, data) {
        // Prevent starting timer when we are unmounted
        if (newState === 'established' && this._isMounted) {
            this.startTimer();
            this.props.call.removeListener('stateChanged', this.callStateChanged);
        }
    }

    startTimer() {
        if (this.timer !== null) {
            // already armed
            return;
        }

        // TODO: consider using window.requestAnimationFrame

        const startTime = new Date();
        this.timer = setInterval(() => {
            this.duration = moment.duration(new Date() - startTime).format('hh:mm:ss', {trim: false});
            if (this.props.show) {
                this.forceUpdate();
            }
        }, 300);
    }

    render() {
        let header;

        if (this.props.show) {
            const textClasses = classNames({
                'lead'          : true
            });

            let callDetail;
            if (this.duration !== null) {
                callDetail = <span><i className="fa fa-clock-o"></i> {this.duration}</span>;
            } else {
                callDetail = 'Connecting...'
            }

            header = (
                <CSSTransition
                    key="call-trans"
                    classNames="videoheader"
                    timeout={{ enter: 300, exit: 300}}
                >
                    <div key="header" className="call-header">
                        <p className={textClasses}><strong>Call with</strong> {this.props.remoteIdentity}</p>
                        <p className={textClasses}>{callDetail}</p>
                    </div>
                </CSSTransition>
            );
        }

        return (
            <div className="top-overlay">
                <TransitionGroup>
                    {header}
                </TransitionGroup>
            </div>
        );
    }
}

CallOverlay.propTypes = {
    show: PropTypes.bool.isRequired,
    remoteIdentity: PropTypes.string.isRequired,
    call: PropTypes.object
};


module.exports = CallOverlay;
