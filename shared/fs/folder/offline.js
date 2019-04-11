// @flow
import * as Kb from '../../common-adapters'
import React from 'react'
import * as Styles from '../../styles/index'
import * as Types from '../../constants/types/fs'
import TopBar from '../top-bar'

type Props = {|
  path: Types.Path,
|}

const OfflineFolder = (props: Props) => (
  <Kb.Box2 direction="vertical" style={styles.contentContainer} fullWidth={true} alignItems={'stretch'}>
    <Kb.BoxGrow>
      <TopBar path={props.path} mode={'offline'} />
      <Kb.Box2
        direction="vertical"
        style={styles.emptyContainer}
        fullHeight={true}
        fullWidth={true}
        centerChildren={true}
      >
        <Kb.Icon type="iconfont-cloud" sizeType={'Huge'} color={Styles.globalColors.black_10} />
        <Kb.Text type="BodySmall">You haven't synced this folder.</Kb.Text>
      </Kb.Box2>
    </Kb.BoxGrow>
  </Kb.Box2>
)

const styles = Styles.styleSheetCreate({
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    ...Styles.globalStyles.flexGrow,
    backgroundColor: Styles.globalColors.blueGrey,
  },
})

export default OfflineFolder
