import React, { useState } from 'react';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { FormattedMessage } from 'react-intl';

import { wallet, savetoLocalStorage } from '../../../../helper/utils';
import {MyButton, MyLink} from '../../../Elements/Button';
import * as actionAccount from '../../../../redux/actions/account';
import * as actionCreate from '../../../../redux/actions/create';
import { getWeb3, grantAccessToken } from '../../../../web3';
import { DivControlBtnKeystore } from '../../../Elements/StyledUtils';
import { encode } from '../../../../helper/encode';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderWidth: '1px',
    borderColor: 'yellow !important',
  },
});

const useStyles = makeStyles(theme => ({
  formCtLb: {
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
}));

function ByMnemonic(props) {
  const { setAccount, setStep, history } = props;
  const [password, setPassword] = useState('');
  const [rePassErr] = useState('');
  // const [isRemember, setIsRemember] = useRemember();
  const [isRemember, setIsRemember] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  async function gotoLogin(e) {
    e.preventDefault();

    const phrase = props.recoveryPhase.trim();
    let message = '';

    if (!phrase) {
        message = 'Please input recovery phrase or key.';

      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    if (!password) {
        message = 'Please input new password.';

      enqueueSnackbar(message, { variant: 'error' });
      return;
    }

    // setLoading(true);

    // setTimeout(async () => {
    try {
      let privateKey = phrase;
      let address;
      let mode = 0;
      if (wallet.isMnemonic(phrase)) {
        const recoveryAccount = wallet.getAccountFromMneomnic(phrase);
        ({ privateKey, address } = recoveryAccount);
        mode = 1;
      } else {
        try {
          address = wallet.getAddressFromPrivateKey(privateKey);
        } catch (err) {
          err.showMessage = 'Invalid recovery phrase.';
          throw err;
        }
      }
      // console.log('getAddressFromPrivateKey', privateKey);

      const tweb3 = getWeb3();
      // const acc = tweb3.wallet.importAccount(privateKey);
      // tweb3.wallet.defaultAccount = address;

      // // check if account is a regular address
      // if (!tweb3.utils.isRegularAccount(acc.address)) {
      //   const m = 'The recovery phrase is for a bank account. LoveLock only accepts regular (non-bank) account.';
      //   const error = new Error(m);
      //   error.showMessage = m;
      //   throw error;
      // }

      const token = tweb3.wallet.createRegularAccount();
      grantAccessToken(address, token.address, isRemember).then(({ returnValue }) => {
        console.log(returnValue)
        tweb3.wallet.importAccount(token.privateKey);
        const keyObject = encode(phrase, password);
        console.log('is remember: ', isRemember)
        const storage = isRemember ? localStorage : sessionStorage;
        // save token account
        storage.sessionData = codecEncode({
          contract: process.env.REACT_APP_CONTRACT,
          tokenAddress: token.address,
          tokenKey: token.privateKey,
          expireAfter: returnValue,
        }).toString('base64');
        // save main account
        savetoLocalStorage({ address, mode, keyObject });
        const account = {
          address,
          privateKey,
          tokenAddress: token.address,
          tokenKey: token.privateKey,
          cipher: password,
          encryptedData: keyObject,
          mode,
          mnemonic: mode === 1 ? phrase : '',
        };
        setAccount(account);
        // setLoading(false);
        history.push('/');
      });
    } catch (error) {
      console.warn(error);
      const m = error.showMessage || `An error occurred: ${error.message || 'unknown'}`;
      enqueueSnackbar(m, { variant: 'error' });
      // setLoading(false);
    }
    // setLoading(false);
    //}, 100);
  }

  function handlePassword(event) {
    const { value } = event.target;
    setPassword(value);
  }

  function handleMnemonic(event) {
    const value = event.target.value.trim();
    props.setRecoveryPhase(value);
  }

  function loginWithPrivatekey() {
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    user = (user && JSON.parse(user)) || {};
    const addr = user.address;
    if (addr) {
      setStep('one');
    } else history.goBack();
  }

  const classes = useStyles();

  return (
    <form onSubmit={gotoLogin}>
      <TextField
        id="outlined-multiline-static"
        label={<FormattedMessage id="login.recoveryLabel" />}
        placeholder={ 'Enter your Recovery phrase or key'}
        multiline
        rows="4"
        onKeyDown={e => e.keyCode === 13 && gotoLogin(e)}
        onChange={handleMnemonic}
        margin="normal"
        variant="outlined"
        fullWidth
        helperText={rePassErr}
        error={rePassErr !== ''}
        autoFocus
        value={props.recoveryPhase}
        // InputLabelProps={{
        //   style: {
        //     textOverflow: 'ellipsis',
        //     whiteSpace: 'nowrap',
        //     overflow: 'hidden',
        //     width: '100%',
        //     color: '#82def9'
        //   } }}
      />
      <TextField
        id="rePassword"
        label={<FormattedMessage id="login.newPassLabel" />}
        placeholder={ 'Enter your password'}
        helperText={rePassErr}
        error={rePassErr !== ''}
        fullWidth
        margin="normal"
        onChange={handlePassword}
        type="password"
        autoComplete="new-password"
      />
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            value={isRemember}
            checked={isRemember}
            color="primary"
            onChange={() => setIsRemember(!isRemember)}
          />
        }
        label={<FormattedMessage id="login.rememberMe" />}
        className={classes.formCtLb}
      />
      <DivControlBtnKeystore>
        <MyLink color="primary" className="backBtn" onClick={loginWithPrivatekey}>
          <FormattedMessage id="login.btnBack" />
        </MyLink>
        <MyButton variant="contained" color="primary" className="nextBtn" type="submit">
          <FormattedMessage id="login.btnRecover" />
        </MyButton>
      </DivControlBtnKeystore>
    </form>
  );
}

const mapStateToProps = state => {
  return {
    // language: 'en'
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
    // setLoading: value => {
    //   dispatch(actionGlobal.setLoading(value));
    // },
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(ByMnemonic)));
