// @flow
import * as React from 'react'
import * as Constants from '../../constants/fs'
import {Box, ConfirmModal, HeaderOnMobile, Icon, MaybePopup, ProgressIndicator} from '../../common-adapters'
import {globalStyles, globalMargins} from '../../styles'

export type Props = {
  onBack: () => void,
  onDelete: () => void,
  name: string,
  title: string,
}

const _Spinner = (props: Props) => (
  <MaybePopup onClose={props.onBack}>
    <Box
      style={{...globalStyles.flexBoxColumn, alignItems: 'center', flex: 1, padding: globalMargins.xlarge}}
    >
      <ProgressIndicator style={{width: globalMargins.medium}} />
    </Box>
  </MaybePopup>
)
const Spinner = HeaderOnMobile(_Spinner)

const Header = (props: Props) => <Icon type="iconfont-trash" sizeType="Big" />

const _ReallyDeleteFile = (props: Props) => (
  <ConfirmModal
    confirmText={`Yes, delete it.`}
    // TODO: this is technically false, in that time travel exists. Change
    //  this text, probably?
    description={`There's no trash can - "${props.name}" will be gone forever.`}
    header={<Header {...props} />}
    onCancel={props.onBack}
    onConfirm={props.onDelete}
    prompt={`Are you sure you want to delete "${props.name}"?`}
    waitingKey={Constants.deleteFolderWaitingKey(props.name)}
  />
)

export default HeaderOnMobile(_ReallyDeleteFile)
export {Spinner}
