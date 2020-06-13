import React from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import { ButtonPro, LinkPro } from './Button';

const Backdrop = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 1s;
  opacity: 0;
`;

const Container = styled.div`
  width: ${props => (props.hasParentDialog ? '550px' : '600px')};
  max-height: 100vh;
  border-radius: 10px;
  box-shadow: 0 14px 52px 0 rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow-x: hidden;
  overflow-y: auto;
  z-index: ${props => (props.ensureTopLevel ? '2001' : props.hasParentDialog ? '1102' : '1101')};
  transition: opacity 0.6s ease-in;
  opacity: 0;
  @media (max-width: 624px) {
    max-height: calc(100vh - 72px);
    width: 100%;
    border-radius: 0;
  }
`;

const PuTitle = styled.div`
  display: flex;
  height: 62px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #8250c8;
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #ffffff;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  .title {
    margin-left: 8px;
  }
  .material-icons {
    cursor: pointer;
    color: white;
  }
  @media (max-width: 624px) {
    border-radius: 0;
  }
`;

const ContWrap = styled.div`
  padding: 30px;
`;

const Action = styled.div`
  .actionConfirm {
    width: 100%;
    margin: 48px 0 16px;
    justify-content: center;
    display: flex;
    @media (min-width: 320px) and (max-width: 623px) {
      .nextBtn {
        width: 100%;
        height: 50px;
      }
    }
    button {
      min-width: 128px;
      line-height: 34px;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
      white-space: nowrap;
    }
    .send {
      background-image: linear-gradient(340deg, #b276ff, #fe8dc3);
    }
    .deny {
      margin-right: 8%;
      background: #ffffff;
      border: 1px solid #5e5e5e;
      display: flex;
      justify-content: center;
      font-weight: 600;
      color: #373737;
      @media (max-width: 413px) {
        margin-right: 4px;
      }
    }
  }
`;

class CommonDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.backdropRef = React.createRef();
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const { hasParentDialog } = this.props;
    this.backdropRef.current.style.opacity = '1';
    this.containerRef.current.style.opacity = '1';
    document.addEventListener('keydown', this.handleKeyDown, true);
    const style = document.body.style;
    this.oldBodyOverflow = style.overflow;
    style.overflow = 'hidden';
    if (hasParentDialog) {
      document.querySelectorAll('.cdialog-container').forEach(e => (e.style.overflow = 'visible'));
      this.containerRef.current && (this.containerRef.current.style.overflowY = 'auto');
    }
  }

  componentWillUnmount() {
    const { hasParentDialog } = this.props;

    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.body.style.overflow = this.oldBodyOverflow;

    if (hasParentDialog) {
      document.querySelectorAll('.cdialog-container').forEach(e => (e.style.overflowY = 'auto'));
    }
  }

  handleKeyDown = e => {
    const { onKeyEsc, close, cancel, confirm } = this.props;
    if (e.keyCode === 27) {
      if (typeof onKeyEsc === 'function') {
        onKeyEsc(e);
      } else if (onKeyEsc === true) {
        const fn = close || cancel;
        fn && fn();
      }
    } else if (e.keyCode === 13) {
      if (document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      const { onKeyReturn } = this.props;
      if (typeof onKeyReturn === 'function') {
        onKeyReturn(e);
      } else if (onKeyReturn === true) {
        confirm && confirm();
      }
    }
  };

  handleBackdropClick = e => {
    const { onKeyEsc, close, cancel } = this.props;
    if (e.target === e.currentTarget) {
      if (typeof onKeyEsc === 'function') {
        onKeyEsc(e);
      } else if (onKeyEsc === true) {
        const fn = close || cancel;
        fn && fn();
      }
    }
  };

  render() {
    const { cancel, confirm, close, okText, cancelText, children, title, hasParentDialog, ensureTopLevel } = this.props;
    const haveCancelButton = cancelText && cancel;
    const haveConfirmButton = okText && confirm;
    
    return (
      <>
        <Backdrop className="cdialog-backdrop" key={1} onClick={this.handleBackdropClick} ref={this.backdropRef} />
        <Container className="cdialog-container" key={2} hasParentDialog={hasParentDialog} ensureTopLevel={ensureTopLevel} ref={this.containerRef}>
          <PuTitle>
            <span className="title">{title}</span>
            <IconButton onClick={close}>
              <i className="material-icons">close</i>
            </IconButton>
          </PuTitle>
          <ContWrap>
            {children}
            {(haveCancelButton || haveConfirmButton) && (
              <Action>
                <div className="actionConfirm">
                  {haveCancelButton && (
                    <LinkPro className="deny nextBtn" onClick={cancel}>
                      {cancelText}
                    </LinkPro>
                  )}
                  {haveConfirmButton && (
                    <ButtonPro className="nextBtn send " onClick={confirm}>
                      {typeof okText !== 'function' ? okText : okText()}
                    </ButtonPro>
                  )}
                </div>
              </Action>
            )}
          </ContWrap>
        </Container>
      </>
    );
  }
}

CommonDialog.defaultProps = {
  close() {},
  cancel() {},
  confirm() {},
  okText: '',
  cancelText: '',
  title: '',
  children: null,
  hasParentDialog: false,
  onKeyEsc: true,
  onKeyReturn: false,
};

export default CommonDialog;
