import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import qs from 'query-string';
import CommaAuth, { config as AuthConfig } from '@commaai/my-comma-auth';

import { EXPLORER_URL } from '../../config';
import Modal from './baseModal';

export default class OnboardingModal extends Component {
  static propTypes = {
    handlePandaConnect: PropTypes.func,
    routes: PropTypes.array
  };

  static instructionalImages = {
    step2: require('../../images/webusb-enable-experimental-features.png'),
    step3: require('../../images/webusb-enable-webusb.png')
  };

  constructor(props) {
    super(props);

    this.state = {
      webUsbEnabled: !!navigator.usb,
      viewingUsbInstructions: false,
      pandaConnected: false
    };

    this.attemptPandaConnection = this.attemptPandaConnection.bind(this);
    this.toggleUsbInstructions = this.toggleUsbInstructions.bind(this);
    this.navigateToExplorer = this.navigateToExplorer.bind(this);
  }

  componentDidMount() {
    // LOCAL HACK: Fetch the static 'routes' list and store it in state
    console.log('Fetching routes.json');
    fetch(`/routes/routes.json`) .then((res) => res.json())
      .then(
        (routes) => {
          console.log('Fetched routes', routes);
          this.setState({
            routes
          });
        },
        (error) => {
          console.log(error)
        }
      );
  }

  attemptPandaConnection() {
    if (!this.state.webUsbEnabled) {
      return;
    }
    this.props.handlePandaConnect();
  }

  toggleUsbInstructions() {
    this.setState({
      viewingUsbInstructions: !this.state.viewingUsbInstructions
    });
  }

  navigateToExplorer() {
    window.location.href = EXPLORER_URL;
  }

  filterRoutesWithCan(drive) {
    return drive.can === true;
  }

  renderPandaEligibility() {
    const { webUsbEnabled, pandaConnected } = this.state;
    const { attemptingPandaConnection } = this.props;
    if (!webUsbEnabled) {
      return (
        <p>
          <i className="fa fa-exclamation-triangle" />
          <span onClick={this.toggleUsbInstructions}>
            <span>WebUSB is not enabled in your Chrome settings</span>
          </span>
        </p>
      );
    }
    if (!pandaConnected && attemptingPandaConnection) {
      return (
        <p>
          <i className="fa fa-spinner animate-spin" />
          <span className="animate-pulse-opacity">
            Waiting for panda USB connection
          </span>
        </p>
      );
    }
  }

  renderLogin() {
    if (CommaAuth.isAuthenticated()) {
      return (
        <button onClick={this.navigateToExplorer} className="button--primary button--kiosk">
          <i className="fa fa-video-camera" />
          <strong>Find a drive in connect</strong>
          <sup>Click "View in cabana" while replaying a drive</sup>
        </button>
      );
    } else {
      return <>
        <a href={ AuthConfig.GOOGLE_REDIRECT_LINK } className="button button--primary button--icon">
          <i className="fa fa-google" />
          <strong>Sign in with Google</strong>
        </a>
        <button onClick={ () => window.AppleID.auth.signIn() } className="button button--primary button--icon">
          <i className="fa fa-apple" />
          <strong>Sign in with Apple</strong>
        </button>
        <a href={ AuthConfig.GITHUB_REDIRECT_LINK } className="button button--primary button--icon">
          <i className="fa fa-github" />
          <strong>Sign in with GitHub</strong>
        </a>
      </>;
    }
  }

  renderOnboardingOptions() {
    if (this.state.routes === undefined) {
      return (
        <div className="cabana-onboarding-modes">Loading...</div>
      );
    }

    return (
      <div className="cabana-onboarding-modes">
        <ul>
          {this.state.routes.map(route => {
            const routeLink=`?route=${route}`;
            return (
              <li key={route}><a href={routeLink}>{route}</a></li>
            );})}
        </ul>
      </div>
    );
  }

  renderUsbInstructions() {
    return (
      <div className="cabana-onboarding-instructions">
        <button
          className="button--small button--inverted"
          onClick={this.toggleUsbInstructions}
        >
          <i className="fa fa-chevron-left" />
          <span> Go back</span>
        </button>
        <h3>Follow these directions to enable WebUSB:</h3>
        <ol className="cabana-onboarding-instructions-list list--bubbled">
          <li>
            <p>
              <strong>Open your Chrome settings:</strong>
            </p>
            <div className="inset">
              <span>
                chrome://flags/#enable-experimental-web-platform-features
              </span>
            </div>
          </li>
          <li>
            <p>
              <strong>Enable Experimental Platform features:</strong>
            </p>
            <img
              alt="Screenshot of Google Chrome Experimental Platform features"
              src={OnboardingModal.instructionalImages.step2}
            />
          </li>
          <li>
            <p>
              <strong>Enable WebUSB:</strong>
            </p>
            <img
              alt="Screenshot of Google Chrome enable WebUSB"
              src={OnboardingModal.instructionalImages.step3}
            />
          </li>
          <li>
            <p>
              <strong>
                Relaunch your Chrome browser and try enabling live mode again.
              </strong>
            </p>
          </li>
        </ol>
      </div>
    );
  }

  renderModalContent() {
    return this.renderOnboardingOptions();
  }

  renderModalFooter() {
    return (
      <p>
        <span>
          Thanks to
          {' '}
          <a
            href="https://comma.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            comma.ai
          </a>
          {' '}
        </span>
        for open sourcing this excellent tool. All bugs & dodgy hacks likely added by me on top of their work.
      </p>
    );
  }

  render() {
    return (
      <Modal
        title="Welcome to Cabana@Home"
        subtitle="Get started by selecting a locally stored route"
        footer={this.renderModalFooter()}
        disableClose
        variations={['wide', 'dark']}
      >
        {this.renderModalContent()}
      </Modal>
    );
  }
}
