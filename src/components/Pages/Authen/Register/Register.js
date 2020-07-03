import React from 'react';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { withRouter } from 'react-router-dom';

import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../Elements/StyledUtils';
// import { HeaderAuthen } from '../../../elements/Common';
import RegisterCore from './RegisterCore';
import RegisterSuccess from './RegisterSuccess';
import * as actionCreate from '../../../../redux/actions/create';
// import ImageCrop from '../../../elements/ImageCrop';

function Register(props) {
  const { step } = props;
  return (
    <div>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              {/* {step === 'one' && <HeaderAuthen title={<FormattedMessage id="regist.regist" />} />} */}
              {step === 'one' && (
                <RegisterCore
                  // avatar={avatar}
                  // avatarData={avatarData}
                />
              )}
              {step === 'two' && <RegisterSuccess />}

            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
      {/* {isOpenCrop && <ImageCrop originFile={originFile} close={closeCrop} accept={acceptCrop} />} */}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    step: state.create.step,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Register));
// export default withRouter(Register)
