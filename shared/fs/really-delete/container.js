// @flow
import * as FsGen from '../../actions/fs-gen'
import * as RouteTreeGen from '../../actions/route-tree-gen'
import * as Container from '../../util/container'
import ReallyDelete from '.'
import {anyWaiting} from '../../constants/waiting'
import * as Types from '../../constants/types/fs'

type OwnProps = Container.RouteProps<{path: Types.Path}, {}>

const mapStateToProps = (state, ownProps) => {
  const path = Container.getRouteProps(ownProps, 'path')
  return {
    _deleting: anyWaiting(state, Types.deleteFolderWaitingKey(path)),
    path: path,
    title: 'Confirmation',
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onBack: () => dispatch(RouteTreeGen.createNavigateUp()),
  onDelete: () => {
    const path = Container.getRouteProps(ownProps, 'path')
    dispatch(FsGen.createDeleteFile({path}))
    // TODO: I think I should be closing this using the waiting key instead,
    //  but I'm not sure how that works.
    dispatch(RouteTreeGen.createNavigateUp())
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  _deleting: stateProps._deleting,
  name: stateProps.path,
  onBack: stateProps._deleting ? () => {} : dispatchProps.onBack,
  onDelete: dispatchProps.onDelete,
  title: stateProps.title,
})

export default Container.compose(
  Container.connect<OwnProps, _, _, _, _>(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  ),
  Container.safeSubmit(['onDelete'], ['_deleting'])
)(ReallyDelete)
