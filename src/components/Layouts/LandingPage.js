import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';

const OutBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SplitLeft = styled.div`
  height: 100%;
  width: 50%;
  position: fixed;
  z-index: 1500;
  top: 0;
  overflow-x: hidden;
  padding-top: 20px;
  left: 0;
  background-color: #261300;
  color: #fff;
  background-size: cover;
  background-image: url('/static/img/landing.svg');
  @media (max-width: 768px) {
    height: 40%;
    width: 100%;
  }
`;

const SplitRight = styled.div`
  height: 100%;
  width: 50%;
  position: fixed;
  z-index: 1500;
  top: 0;
  overflow-x: hidden;
  padding-top: 20px;
  right: 0;
  background-color: #fff;
  @media (max-width: 768px) {
    height: 65%;
    width: 100%;
    top: 40%;
  }
`;

const SplitContentLeft = styled.div`
  position: absolute;
  top: 47%;
  left: 50%;
  max-width: 100%;
  transform: translate(-50%, -50%);
  .imgView {
    margin-left: 243px;
  }
`;

const LoveLockQuote = styled.div`
  width: 100%;
  height: 100%;
  font-size: 18px;
  font-stretch: normal;
  line-height: 1.45;
  color: #ffffff;
  position: relative;
  @media (max-width: 414px) {
    font-size: 16px;
    .more {
      display: none;
    }
  }
  ::before {
    content: open-quote;
    font-size: 80px;
    top: -40px;
    left: -40px;
    position: absolute;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SplitContentRight = styled.div`
  position: absolute;
  top: 44%;
  left: 44%;
  transform: translate(-50%, -50%);
  text-align: left;
  img {
    width: 64px;
    height: 64px;
  }
  .imgView {
    margin: 16px auto;
  }
  .signUpTitle {
    font-size: 25px;
    line-height: 32px;
  }
  .signUpSubTitle {
    color: #14171a;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
  .signUpBtn {
    margin-right: 16px;
    width: 130px;
    height: 40px;
  }
`;

const SignupForm = styled.div`
  margin: 30px auto;
  line-height: 3.5;
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  background: #fff;
  width: 100%;
  color: #aab8c2;
  display: flex;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

const Copyright = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
    }
  }
  .footRight {
    margin-left: 10px;
  }
`;

class LandingPage extends PureComponent {
  render() {
    const isLock = window.location.pathname.indexOf('/lock/') === 0;
    return !isLock ? (
      <>
        <OutBox>
          <SplitLeft>
            <SplitContentLeft>
              <LoveLockQuote>
              A forum that permit you to demand a great answer based on your budget in a decentralized and reliable way!
              </LoveLockQuote>
            </SplitContentLeft> 
          </SplitLeft>
          <SplitRight>
            <SplitContentRight>
              {/* <div className="imgView">
                <img src="/static/img/logo.svg" alt="loveLock" />
              </div> */}
              {/* <h1 className="signUpTitle"> */}
                {/* <FormattedMessage id="landing.tagline" /> */}
                {/* abc */}
              {/* </h1> */}
              
              <SignupForm>
                <h2 className="signUpSubTitle">
                  Join AnswerIt now!
                </h2>
                <Button href="/register" className="signUpBtn" variant="contained" color="primary">
                  Register
                </Button>
                <Button href="/login" className="signUpBtn" variant="outlined" color="primary">
                  Login
                </Button>
              </SignupForm>
            </SplitContentRight>
          </SplitRight>
        </OutBox>
        <FooterWapper>
          <Copyright>
            <p>
              Powered by&nbsp;
              <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
                Icetea Platform
              </a>
            </p>
          </Copyright>
          <Copyright>
            <div className="footRight">
              <p>
                &copy; 2019&nbsp;
                <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
                  Trada Technology
                </a>
              </p>
            </div>
          </Copyright>
        </FooterWapper>
      </>
    ) : (
      <div />
    );
  }
}

export default withRouter(LandingPage);
