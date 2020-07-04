import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { Grid, TextField } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { FormattedMessage } from 'react-intl';

// import { AvatarPro } from '../../../elements';
import { getWeb3, grantAccessToken } from '../../../../web3';
import { wallet, savetoLocalStorage } from '../../../../helper/utils';
import { decode } from '../../../../helper/decode';
import { getTagsInfo } from '../../../../helper/account';
// import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../redux/actions/account';
import * as actionCreate from '../../../../redux/actions/create';
import { DivControlBtnKeystore } from '../../../Elements/StyledUtils';
import Button from '@material-ui/core/Button';
import { encode } from '../../../../helper/encode';
// import { useRemember } from '../../../../helper/hooks';

const useStyles = makeStyles(theme => ({
  avatar: {
    marginTop: theme.spacing(1),
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
    },
  },
  inputPassForm: {
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
  formCtLb: {
    '@media (max-width: 768px)': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
}));

function ByPassWord(props) {
  const { setAccount, setStep, history, encryptedData } = props;
  const [state, setState] = React.useState({
    username: '',
    avatar: '',
  });
  const [password, setPassword] = useState('');
  // const [isRemember, setIsRemember] = useRemember();
  const [isRemember, setIsRemember] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function loadData() {
      const { address } = props;
      if (address) {
        const reps = await getTagsInfo(address);
        if (reps) {
          setState({ ...state, username: reps['display-name'] || '', avatar: reps.avatar });
        }
      } else {
        setState({ ...state, username: 'undefined' });
        let message =
          'This is the first time log in on this machine. If you created an account on another machine, please enter recovery phrase.';

        enqueueSnackbar(message, {
          variant: 'info',
          autoHideDuration: 15000,
          // anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
        setStep('two');
      }
    }

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function gotoLogin() {
    if (encryptedData) {
      // setLoading(true);

      setTimeout(() => {
        try {
          const decodeOutput = decode(password, encryptedData);
          let mode = 0;
          let privateKey;
          let address;
          if (wallet.isMnemonic(decodeOutput)) {
            const account = wallet.getAccountFromMneomnic(decodeOutput);
            ({ privateKey, address } = account);
            mode = 1;
          } else {
            privateKey = decodeOutput;
            address = wallet.getAddressFromPrivateKey(privateKey);
          }

          // const privateKey = codec.toString(decode(password, encryptedData).privateKey);
          // const address = wallet.getAddressFromPrivateKey(privateKey);
          // const account = { address, privateKey, cipher: password };
          const tweb3 = getWeb3();
          tweb3.wallet.importAccount(privateKey);
          // tweb3.wallet.defaultAccount = address;

          const token = tweb3.wallet.createRegularAccount();
          grantAccessToken(address, token.address, isRemember).then(({ returnValue }) => {
            console.log(returnValue)
            tweb3.wallet.importAccount(token.privateKey);
            const keyObject = encode(privateKey, password);
            console.log('is remember: ', isRemember)
            // const storage = isRemember ? localStorage : sessionStorage;
            const storage = localStorage             // save token account
            storage.sessionData = codecEncode({
              contract: process.env.REACT_APP_CONTRACT,
              tokenAddress: token.address,
              tokenKey: token.privateKey,
              expireAfter: returnValue,
            }).toString('base64');
            // re-save main account
            savetoLocalStorage({ address, mode, keyObject });
            const account = {
              address,
              privateKey,
              tokenAddress: token.address,
              tokenKey: token.privateKey,
              cipher: password,
              encryptedData: keyObject,
              mode,
            };
            setAccount(account);
            // setLoading(false);
            setTimeout(() => {
              history.push('/');
            }, 1);
          });
        } catch (error) {
          console.error(error);
          const message = 'Your password is invalid. Please try again.';
          enqueueSnackbar(message, { variant: 'error' });
          // setLoading(false);
        }
      }, 100);
    } else {
      const message = `An error has occured. Please try using forgot password.`;
      enqueueSnackbar(message, { variant: 'error' });
    }
  }

  function handlePassword(event) {
    const { value } = event.currentTarget;
    setPassword(value);
  }

  function loginWithSeed() {
    setStep('two');
  }

  const classes = useStyles();
  return (
    <>
      <Grid className={classes.avatar} container spacing={2} alignItems="flex-end">
        <Grid item>
          {/* <AvatarPro hash={state.avatar} /> */}
        </Grid>
        <Grid item>
          <TextField
            label={<FormattedMessage id="login.userName" />}
            value={state.username}
            disabled
            autoComplete="username"
          />
        </Grid>
      </Grid>
      <ValidatorForm onSubmit={gotoLogin} className={classes.inputPassForm}>
        <TextValidator
          label={<FormattedMessage id="login.password" />}
          fullWidth
          onChange={handlePassword}
          name="password"
          type="password"
          validators={['required']}
          errorMessages={[<FormattedMessage id="login.passReqMes" />]}
          margin="normal"
          value={password}
          inputProps={{ autoComplete: 'current-password' }}
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
          <Button onClick={loginWithSeed}>
            <FormattedMessage id="login.forgotPass" />
          </Button>
          <Button type="submit" className="nextBtn">
            <FormattedMessage id="login.btnLogin" />
          </Button>
        </DivControlBtnKeystore>
      </ValidatorForm>
    </>
  );
}

const mapStateToProps = state => {
  return {
    encryptedData: state.account.encryptedData,
    address: state.account.address,
    // language: state.globalData.language,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ByPassWord));
