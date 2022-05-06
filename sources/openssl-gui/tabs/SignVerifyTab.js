import React from 'react';

import { Trans } from 'react-i18next';
import i18next from '../../translations';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import CommandField from '../CommandField';
import Helpers from '../Helpers';

class SignVerifyTab extends React.Component {
  // should get props: files, runCommand

  constructor(props) {
    super(props);

    this.state = {
      /* default values */

      signingFields: {
        inputtype: 'text',
        inputtext: i18next.t('Hello world'),
        passphrasetype: 'text',
        outputfile: 'signed.data',
      },

      verifyFields: {
        inputtype: 'text',
        inputtext: i18next.t('Hello world'),
      },
    };

    // save initial state for reset (copy - no reference)
    this._initialState = JSON.parse(JSON.stringify(this.state));
  }

  render() {
    // filter files for private and public keys
    this.privateKeys = Helpers.getPrivateKeysFilenamesFromFiles(this.props.files);
    this.publicKeys = Helpers.getPublicKeysFilenamesFromFiles(this.props.files);

    // check if last selected privkey is still available
    if (
      this.state.signingFields.privkey != '' && // "" means "Select file"
      !this.privateKeys.includes(this.state.signingFields.privkey)
    )
      this.state.signingFields.privkey = undefined;

    // check if last selected pubkey is still available
    if (
      this.state.verifyFields.pubkey != '' && // "" means "Select file"
      !this.publicKeys.includes(this.state.verifyFields.pubkey)
    )
      this.state.verifyFields.pubkey = undefined;

    // check if last selected sigfile is still available
    if (
      this.state.verifyFields.sigfile != '' && // "" means "Select file"
      !this.props.files.some((f) => f.name == this.state.verifyFields.sigfile)
    )
      this.state.verifyFields.sigfile = undefined;

    // set default privkey file (on files update)
    if (this.state.signingFields.privkey == undefined && this.privateKeys.length > 0)
      this.state.signingFields.privkey = this.privateKeys[0];

    // set default pubkey file (on files update)
    if (this.state.verifyFields.pubkey == undefined && this.publicKeys.length > 0)
      this.state.verifyFields.pubkey = this.publicKeys[0];

    // check if selected privkey is encrypted
    if (this.state.signingFields.privkey != '') {
      let privkeyFile = this.props.files.find(
        (file) => file.name == this.state.signingFields.privkey
      );
      this.isPrivateKeyEncrypted = privkeyFile ? Helpers.isKeyEncrypted(privkeyFile) : undefined;
    } else this.isPrivateKeyEncrypted = undefined;

    // validate fields and build command for signing
    const whatsValidSign = this._validateSigningFields();
    const signingCommand = this._buildSigningCommand(whatsValidSign);

    // validate fields and build command for verify
    const whatsValidVery = this._validateVerifyFields();
    const verifyCommand = this._buildVerifyCommand(whatsValidVery);

    return (
      <>
        <Card>
          <Card.Header className={'d-flex align-items-center justify-content-between'}>
            <b>
              1) <Trans>Sign with private key</Trans>
            </b>
            <Button variant="dark" size="sm" onClick={() => this._resetSigningFields()}>
              <i className="fa fa-undo"></i> <Trans>Reset fields</Trans>
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group>
                <Form.Label>
                  <span className="mr-3">
                    <Trans>Input</Trans>:
                  </span>
                  <Form.Check
                    custom
                    inline
                    type="radio"
                    name="inputtype"
                    value="text"
                    label="Text"
                    onChange={(e) => this._onSigningFieldChange(e)}
                    id="signing-inputtype-text"
                    checked={this.state.signingFields.inputtype == 'text'}
                  />
                  <Form.Check
                    custom
                    inline
                    type="radio"
                    name="inputtype"
                    value="file"
                    label={i18next.t('File')}
                    onChange={(e) => this._onSigningFieldChange(e)}
                    id="signing-inputtype-file"
                    checked={this.state.signingFields.inputtype == 'file'}
                  />
                </Form.Label>

                {this.state.signingFields.inputtype == 'text' && (
                  <Form.Control
                    as="textarea"
                    name="inputtext"
                    value={this.state.signingFields.inputtext}
                    onChange={(e) => this._onSigningFieldChange(e)}
                    isValid={whatsValidSign.inputtext}
                    isInvalid={this._isInvalid(whatsValidSign.inputtext)}
                    rows={3}
                  />
                )}

                {this.state.signingFields.inputtype == 'file' && (
                  <Form.Control
                    as="select"
                    value={this.state.signingFields.inputfile}
                    name="inputfile"
                    onChange={(e) => this._onSigningFieldChange(e)}
                    isInvalid={this._isInvalid(whatsValidSign.inputfile)}
                    isValid={whatsValidSign.inputfile}
                  >
                    <option key={0} value="">
                      {i18next.t('Select file')}
                    </option>
                    {this.props.files.map((file) => (
                      <option key={file.name} value={file.name}>
                        {file.name}
                      </option>
                    ))}
                  </Form.Control>
                )}
              </Form.Group>

              <Row>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <Trans>Private key</Trans>
                    </Form.Label>
                    <Form.Control
                      required
                      as="select"
                      value={this.state.signingFields.privkey}
                      name="privkey"
                      onChange={(e) => this._onSigningFieldChange(e)}
                      isValid={whatsValidSign.privkey}
                      isInvalid={this._isInvalid(whatsValidSign.privkey)}
                    >
                      <option key={0} value="">
                        {i18next.t('Select file')}
                      </option>
                      {this.privateKeys.map((privkey) => (
                        <option key={privkey} value={privkey}>
                          {privkey}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="d-block">
                      <span className={'mr-3 ' + (!this.isPrivateKeyEncrypted ? 'text-muted' : '')}>
                        Passphrase:
                      </span>
                      <Form.Check
                        custom
                        inline
                        type="radio"
                        name="passphrasetype"
                        value="text"
                        label="Text"
                        onChange={(e) => this._onSigningFieldChange(e)}
                        id="signing-passphrasetype-text"
                        disabled={!this.isPrivateKeyEncrypted}
                        checked={this.state.signingFields.passphrasetype == 'text'}
                      />
                      <Form.Check
                        custom
                        inline
                        type="radio"
                        name="passphrasetype"
                        value="file"
                        label={i18next.t('File')}
                        onChange={(e) => this._onSigningFieldChange(e)}
                        id="signing-passphrasetype-file"
                        disabled={!this.isPrivateKeyEncrypted}
                        checked={this.state.signingFields.passphrasetype == 'file'}
                      />
                    </Form.Label>

                    {this.state.signingFields.passphrasetype == 'text' && (
                      <Form.Control
                        type="password"
                        placeholder={i18next.t(
                          this.isPrivateKeyEncrypted
                            ? 'Enter passphrase ..'
                            : this.state.signingFields.privkey?.length > 0
                            ? 'Private key not encrypted'
                            : 'No private key selected'
                        )}
                        name="passphrasetext"
                        value={
                          this.isPrivateKeyEncrypted
                            ? this.state.signingFields.passphrasetext || ''
                            : ''
                        }
                        onChange={(e) => this._onSigningFieldChange(e)}
                        disabled={!this.isPrivateKeyEncrypted}
                        isInvalid={this._isInvalid(whatsValidSign.passphrasetext)}
                        isValid={whatsValidSign.passphrasetext}
                      />
                    )}

                    {this.state.signingFields.passphrasetype == 'file' && (
                      <Form.Control
                        as="select"
                        value={
                          this.isPrivateKeyEncrypted ? this.state.signingFields.passphrasefile : ''
                        }
                        name="passphrasefile"
                        onChange={(e) => this._onSigningFieldChange(e)}
                        disabled={!this.isPrivateKeyEncrypted}
                        isInvalid={this._isInvalid(whatsValidSign.passphrasefile)}
                        isValid={whatsValidSign.passphrasefile}
                      >
                        <option key={0} value="">
                          {i18next.t(
                            this.isPrivateKeyEncrypted ? 'Select file' : 'Private key not encrypted'
                          )}
                        </option>
                        {this.props.files.map((file) => (
                          <option key={file.name} value={file.name}>
                            {file.name}
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <Form.Check
                        custom
                        inline
                        type="checkbox"
                        name="useoutputfile"
                        id="signing-useoutputfile"
                        label={i18next.t('Output to file')}
                        value={this.state.signingFields.useoutputfile == 'true' ? 'false' : 'true'}
                        onChange={(e) => this._onSigningFieldChange(e)}
                        checked={this.state.signingFields.useoutputfile == 'true'}
                      />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={this.state.signingFields.outputfile || ''}
                      name="outputfile"
                      onChange={(e) => this._onSigningFieldChange(e)}
                      disabled={this.state.signingFields.useoutputfile != 'true'}
                      isInvalid={this._isInvalid(whatsValidSign.outputfile)}
                      isValid={whatsValidSign.outputfile}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Label className="d-block">
                    <Trans>Options</Trans>:
                  </Form.Label>
                  <Form.Check
                    custom
                    inline
                    type="checkbox"
                    name="base64"
                    id="signing-base64"
                    disabled={true}
                    label="Base64 (todo)"
                    value={this.state.signingFields.base64 == 'true' ? 'false' : 'true'}
                    onChange={(e) => this._onSigningFieldChange(e)}
                    checked={this.state.base64 == 'true'}
                  />
                </Col>
              </Row>
            </Form>

            <hr style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }} />
            <CommandField
              command={signingCommand}
              runCommand={this.props.runCommand}
              enableRun={!Object.values(whatsValidSign).includes(false)}
            />
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Header className={'d-flex align-items-center justify-content-between'}>
            <b>
              2) <Trans>Verify with public key</Trans>
            </b>
            <Button variant="dark" size="sm" onClick={() => this._resetVerifyFields()}>
              <i className="fa fa-undo"></i> <Trans>Reset fields</Trans>
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group>
                <Form.Label>
                  <span className="mr-3">
                    <Trans>Input</Trans>:
                  </span>
                  <Form.Check
                    custom
                    inline
                    type="radio"
                    name="inputtype"
                    value="text"
                    label="Text"
                    onChange={(e) => this._onVerifyFieldChange(e)}
                    id="verify-inputtype-text"
                    checked={this.state.verifyFields.inputtype == 'text'}
                  />
                  <Form.Check
                    custom
                    inline
                    type="radio"
                    name="inputtype"
                    value="file"
                    label={i18next.t('File')}
                    onChange={(e) => this._onVerifyFieldChange(e)}
                    id="verify-inputtype-file"
                    checked={this.state.verifyFields.inputtype == 'file'}
                  />
                </Form.Label>

                {this.state.verifyFields.inputtype == 'text' && (
                  <Form.Control
                    as="textarea"
                    name="inputtext"
                    value={this.state.verifyFields.inputtext}
                    onChange={(e) => this._onVerifyFieldChange(e)}
                    isValid={whatsValidVery.inputtext}
                    isInvalid={this._isInvalid(whatsValidVery.inputtext)}
                    rows={3}
                  />
                )}

                {this.state.verifyFields.inputtype == 'file' && (
                  <Form.Control
                    as="select"
                    value={this.state.verifyFields.inputfile}
                    name="inputfile"
                    onChange={(e) => this._onVerifyFieldChange(e)}
                    isValid={whatsValidVery.inputfile}
                    isInvalid={this._isInvalid(whatsValidVery.inputfile)}
                  >
                    <option key={0} value="">
                      {i18next.t('Select file')}
                    </option>
                    {this.props.files.map((file) => (
                      <option key={file.name} value={file.name}>
                        {file.name}
                      </option>
                    ))}
                  </Form.Control>
                )}
              </Form.Group>

              <Row>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <Trans>Public key</Trans>
                    </Form.Label>
                    <Form.Control
                      required
                      as="select"
                      value={this.state.verifyFields.pubkey}
                      name="pubkey"
                      onChange={(e) => this._onVerifyFieldChange(e)}
                      isValid={whatsValidVery.pubkey}
                      isInvalid={this._isInvalid(whatsValidVery.pubkey)}
                    >
                      <option key={0} value="">
                        {i18next.t('Select file')}
                      </option>
                      {this.publicKeys.map((pubkey) => (
                        <option key={pubkey} value={pubkey}>
                          {pubkey}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>
                      <Trans>Signature file</Trans>
                    </Form.Label>
                    <Form.Control
                      required
                      as="select"
                      value={this.state.verifyFields.sigfile || ''}
                      name="sigfile"
                      onChange={(e) => this._onVerifyFieldChange(e)}
                      isValid={whatsValidVery.sigfile}
                      isInvalid={this._isInvalid(whatsValidVery.sigfile)}
                    >
                      <option key={0} value="">
                        {i18next.t('Select file')}
                      </option>
                      {this.props.files.map((file) => (
                        <option key={file.name} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Form>

            <hr style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }} />
            <CommandField
              command={verifyCommand}
              runCommand={this.props.runCommand}
              enableRun={!Object.values(whatsValidVery).includes(false)}
            />
          </Card.Body>
        </Card>
      </>
    );
  }

  /* signing fields handling */

  _onSigningFieldChange(e) {
    this.setState({
      signingFields: { ...this.state.signingFields, [e.target.name]: e.target.value },
    });
  }

  _validateSigningFields() {
    let whatsValid = {};

    // check if input text is valid
    if (this.state.signingFields.inputtype == 'text')
      whatsValid.inputtext = !!this.state.signingFields.inputtext;

    // check if input file is valid
    if (this.state.signingFields.inputtype == 'file')
      whatsValid.inputfile = !!this.state.signingFields.inputfile;

    // check if privkey was selected
    whatsValid.privkey = !!this.state.signingFields.privkey;

    // check if passphrase was provided
    if (this.isPrivateKeyEncrypted) {
      // check if passphrase text is valid
      if (this.state.signingFields.passphrasetype == 'text')
        whatsValid.passphrasetext = !!this.state.signingFields.passphrasetext;

      // check if passphrase file is valid
      if (this.state.signingFields.passphrasetype == 'file')
        whatsValid.passphrasefile = !!this.state.signingFields.passphrasefile;
    }

    // check if output file is valid
    if (this.state.signingFields.useoutputfile == 'true')
      whatsValid.outputfile = !!(this.state.signingFields.outputfile || '').trim();

    return whatsValid;
  }

  _buildSigningCommand(whatsValid = {}) {
    if (Object.values(whatsValid).includes(false)) return i18next.t('Please fill in all fields');

    let command = 'openssl pkeyutl -sign';
    command += ' -inkey ' + this.state.signingFields.privkey;

    if (this.isPrivateKeyEncrypted) {
      if (this.state.signingFields.passphrasetype == 'text')
        command += ' -passin pass:' + this.state.signingFields.passphrasetext;

      if (this.state.signingFields.passphrasetype == 'file')
        command += ' -passin file:' + this.state.signingFields.passphrasefile;
    }

    if (this.state.signingFields.inputtype == 'text')
      command = 'echo ' + this.state.signingFields.inputtext + ' | ' + command;

    if (this.state.signingFields.inputtype == 'file')
      command += ' -in ' + this.state.signingFields.inputfile;

    if (this.state.signingFields.useoutputfile == 'true')
      command += ' -out ' + this.state.signingFields.outputfile;

    return command;
  }

  _resetSigningFields() {
    this.setState({ signingFields: this._initialState.signingFields });
  }

  /* verification fields handling */

  _onVerifyFieldChange(e) {
    this.setState({
      verifyFields: { ...this.state.verifyFields, [e.target.name]: e.target.value },
    });
  }

  _validateVerifyFields() {
    let whatsValid = {};

    // check if input text is valid
    if (this.state.verifyFields.inputtype == 'text')
      whatsValid.inputtext = !!this.state.verifyFields.inputtext;

    // check if input file is valid
    if (this.state.verifyFields.inputtype == 'file')
      whatsValid.inputfile = !!this.state.verifyFields.inputfile;

    // check if public key was selected
    whatsValid.pubkey = !!this.state.verifyFields.pubkey;

    // check if signature file was selected
    whatsValid.sigfile = !!this.state.verifyFields.sigfile;

    return whatsValid;
  }

  _buildVerifyCommand(whatsValid = {}) {
    if (Object.values(whatsValid).includes(false)) return i18next.t('Please fill in all fields');

    let command = 'openssl pkeyutl -verify';
    command += ' -pubin -inkey ' + this.state.verifyFields.pubkey;

    if (this.state.verifyFields.inputtype == 'text')
      command = 'echo ' + this.state.verifyFields.inputtext + ' | ' + command;

    if (this.state.verifyFields.inputtype == 'file')
      command += ' -in ' + this.state.verifyFields.inputfile;

    command += ' -sigfile ' + this.state.verifyFields.sigfile;

    return command;
  }

  _resetVerifyFields() {
    this.setState({ verifyFields: this._initialState.verifyFields });
  }

  /* helper functions */

  _isInvalid(value) {
    // make undefined not mean false
    if (value == undefined) return undefined;
    else return !value;
  }
}

export default SignVerifyTab;
