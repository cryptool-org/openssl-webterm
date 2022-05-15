import React from 'react';
import { Trans } from 'react-i18next';

import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

import EncryptionTab from './tabs/EncryptionTab';
import FilesTab from './tabs/FilesTab';
import GenKeysTab from './tabs/GenKeysTab';
import SignVerifyTab from './tabs/SignVerifyTab';
import HashesTab from './tabs/HashesTab';
import WelcomeTabContent from './tabs/WelcomeTab';

class OpenSSLGUI extends React.Component {
  state = { filesdirty: false };

  shouldComponentUpdate(nextProps, nextState) {
    // checks if files have changed

    const prevPropsFileList = this.props.files.map((file) => file.name);
    const nextPropsFileList = nextProps.files.map((file) => file.name);

    const combinedFileList = prevPropsFileList.concat(
      nextPropsFileList.filter((file) => prevPropsFileList.indexOf(file) < 0)
    );

    for (const filename of combinedFileList) {
      if (!prevPropsFileList.includes(filename)) {
        console.log('file ' + filename + ' was newly created');
        nextState.filesdirty = true;
        break;
      } else if (!nextPropsFileList.includes(filename)) {
        console.log('file ' + filename + ' was deleted');
        nextState.filesdirty = true;
        break;
      } else {
        const prevFile = this.props.files.find((file) => file.name == filename);
        const nextFile = nextProps.files.find((file) => file.name == filename);

        if (prevFile.bytes.length != nextFile.bytes.length) {
          console.log('contents of ' + filename + ' have changed');
          nextState.filesdirty = true;
          break;
        }
      }
    }

    // todo: show in files tab which files have changed?

    return true; // update anyway
  }

  render() {
    return (
      <Tab.Container defaultActiveKey="welcome" onSelect={(ek) => this.onTabSelect(ek)}>
        <Card className="osslgui my-3">
          <Card.Header>
            <Nav className="flex-column flex-md-row" variant="pills">
              <Nav.Item>
                <Nav.Link eventKey="welcome">
                  <Trans>Welcome</Trans>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="encryption">
                  <Trans>Encrypt &amp; Decrypt</Trans>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="genkeys">
                  <Trans>Generate Keys</Trans>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="signverify">
                  <Trans>Sign &amp; Verify</Trans>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="hashes">
                  <Trans>Hashes</Trans>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="files">
                  <Trans>Files</Trans>
                  {this.state.filesdirty && (
                    <Badge variant="dark" className="ml-2">
                      <Trans>New</Trans>
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              {this.props.fullscreen && (
                <Nav.Item>
                  <Nav.Link className="text-danger" onClick={this.props.exitFullscreen}>
                    <Trans>Exit</Trans>
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="welcome">
                <WelcomeTabContent />
              </Tab.Pane>
              <Tab.Pane eventKey="encryption">
                <EncryptionTab
                  files={this.props.files}
                  cipherList={this.props.cipherList}
                  runCommand={this.props.runCommand}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="genkeys">
                <GenKeysTab
                  files={this.props.files}
                  cipherList={this.props.cipherList}
                  curvesList={this.props.curvesList}
                  runCommand={this.props.runCommand}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="signverify">
                <SignVerifyTab files={this.props.files} runCommand={this.props.runCommand} />
              </Tab.Pane>
              <Tab.Pane eventKey="hashes">
                <HashesTab
                  files={this.props.files}
                  hashfunList={this.props.hashfunList}
                  runCommand={this.props.runCommand}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="files">
                <FilesTab files={this.props.files} setFiles={this.props.setFiles} />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    );
  }

  onTabSelect(eventKey) {
    if (eventKey == 'files') this.setState({ filesdirty: false });
  }
}

export default OpenSSLGUI;
