// @flow
import * as I from 'immutable'
import * as React from 'react'
import * as Constants from '../../../constants/chat2'
import * as Types from '../../../constants/types/chat2'
import * as Chat2Gen from '../../../actions/chat2-gen'
import * as RouteTreeGen from '../../../actions/route-tree-gen'
import Inbox from '..'
import {isMobile} from '../../../constants/platform'
import {namedConnect} from '../../../util/container'
import type {Props as _Props, RowItemSmall, RowItemBig} from '../index.types'
import normalRowData from './normal'

type OwnProps = {|
  routeState: I.RecordOf<{
    smallTeamsExpanded: boolean,
  }>,
  navigateAppend: (...Array<any>) => any,
|}

const mapStateToProps = state => {
  const metaMap = state.chat2.metaMap
  const {allowShowFloatingButton, rows, smallTeamsExpanded} = normalRowData(
    metaMap,
    state.chat2.smallTeamsExpanded,
    state.chat2.selectedConversation
  )
  const neverLoaded = !state.chat2.inboxHasLoaded
  const _canRefreshOnMount = neverLoaded && !Constants.anyChatWaitingKeys(state)

  return {
    _badgeMap: state.chat2.badgeMap,
    _canRefreshOnMount,
    _hasLoadedTrusted: state.chat2.trustedInboxHasLoaded,
    _selectedConversationIDKey: Constants.getSelectedConversation(state),
    allowShowFloatingButton,
    neverLoaded,
    rows,
    smallTeamsExpanded,
  }
}

const mapDispatchToProps = (dispatch, {navigateAppend}) => ({
  _onInitialLoad: (conversationIDKeys: Array<Types.ConversationIDKey>) =>
    dispatch(Chat2Gen.createMetaNeedsUpdating({conversationIDKeys, reason: 'initialTrustedLoad'})),
  _onSelect: (conversationIDKey: Types.ConversationIDKey) =>
    dispatch(Chat2Gen.createSelectConversation({conversationIDKey, reason: 'inboxFilterChanged'})),
  _onSelectNext: (rows, selectedConversationIDKey, direction) => {
    const goodRows: Array<RowItemSmall | RowItemBig> = rows.reduce((arr, row) => {
      if (row.type === 'small' || row.type === 'big') {
        arr.push(row)
      }
      return arr
    }, [])
    const idx = goodRows.findIndex(row => row.conversationIDKey === selectedConversationIDKey)
    if (goodRows.length) {
      const {conversationIDKey} = goodRows[(idx + direction + goodRows.length) % goodRows.length]
      dispatch(Chat2Gen.createSelectConversation({conversationIDKey, reason: 'inboxFilterArrow'}))
    }
  },
  _refreshInbox: () => dispatch(Chat2Gen.createInboxRefresh({reason: 'componentNeverLoaded'})),
  onNewChat: () =>
    dispatch(
      RouteTreeGen.createNavigateAppend({
        path: [{props: {}, selected: 'chatNewChat'}],
      })
    ),
  onUntrustedInboxVisible: (conversationIDKeys: Array<Types.ConversationIDKey>) =>
    dispatch(
      Chat2Gen.createMetaNeedsUpdating({
        conversationIDKeys,
        reason: 'untrusted inbox visible',
      })
    ),
  toggleSmallTeamsExpanded: () => dispatch(Chat2Gen.createToggleSmallTeamsExpanded()),
})

// This merge props is not spreading on purpose so we never have any random props that might mutate and force a re-render
const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const unreadIndices = []
  for (let i = stateProps.rows.length - 1; i >= 0; i--) {
    const row = stateProps.rows[i]
    if (!['big', 'bigHeader'].includes(row.type)) {
      // only check big teams for large inbox perf
      break
    }
    if (
      row.conversationIDKey &&
      stateProps._badgeMap.get(row.conversationIDKey) &&
      (isMobile || row.conversationIDKey !== stateProps._selectedConversationIDKey)
    ) {
      // on mobile include all convos, on desktop only not currently selected convo
      unreadIndices.unshift(i)
    }
  }
  return {
    _canRefreshOnMount: stateProps._canRefreshOnMount,
    _hasLoadedTrusted: stateProps._hasLoadedTrusted,
    _onInitialLoad: dispatchProps._onInitialLoad,
    _refreshInbox: dispatchProps._refreshInbox,
    allowShowFloatingButton: stateProps.allowShowFloatingButton,
    neverLoaded: stateProps.neverLoaded,
    onDeselectConversation: () => dispatchProps._onSelect(Constants.noConversationIDKey),
    onEnsureSelection: () => {
      // $ForceType
      if (stateProps.rows.find(r => r.conversationIDKey === stateProps._selectedConversationIDKey)) {
        return
      }
      const first = stateProps.rows[0]
      if ((first && first.type === 'small') || first.type === 'big') {
        dispatchProps._onSelect(first.conversationIDKey)
      }
    },
    onNewChat: dispatchProps.onNewChat,
    onSelectDown: () =>
      dispatchProps._onSelectNext(stateProps.rows, stateProps._selectedConversationIDKey, 1),
    onSelectUp: () => dispatchProps._onSelectNext(stateProps.rows, stateProps._selectedConversationIDKey, -1),
    onUntrustedInboxVisible: dispatchProps.onUntrustedInboxVisible,
    rows: stateProps.rows,
    selectedConversationIDKey: isMobile
      ? Constants.noConversationIDKey
      : stateProps._selectedConversationIDKey, // unused on mobile so don't cause updates
    smallTeamsExpanded: stateProps.smallTeamsExpanded,
    toggleSmallTeamsExpanded: dispatchProps.toggleSmallTeamsExpanded,
    unreadIndices: I.List(unreadIndices),
  }
}

type Props = {|
  ..._Props,
  _hasLoadedTrusted: boolean,
  _onInitialLoad: (Array<Types.ConversationIDKey>) => void,
  _refreshInbox: () => void,
  _canRefreshOnMount: boolean,
|}

class InboxWrapper extends React.PureComponent<Props> {
  _onSelectUp = () => this.props.onSelectUp()
  _onSelectDown = () => this.props.onSelectDown()

  componentDidMount() {
    if (this.props._canRefreshOnMount) {
      this.props._refreshInbox()
    }
    if (!this.props._hasLoadedTrusted && this.props.rows.length) {
      const toUnbox = this.props.rows.slice(0, 20).reduce((arr, row) => {
        if (row.type === 'small' || row.type === 'big') {
          arr.push(row.conversationIDKey)
        }
        return arr
      }, [])
      if (toUnbox.length) {
        this.props._onInitialLoad(toUnbox)
      }
    }
  }

  render() {
    const {_hasLoadedTrusted, _refreshInbox, _onInitialLoad, _canRefreshOnMount, ...rest} = this.props
    return <Inbox {...rest} onSelectUp={this._onSelectUp} onSelectDown={this._onSelectDown} />
  }
}

const Connected = namedConnect<OwnProps, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  'Inbox'
)(InboxWrapper)

export default Connected
