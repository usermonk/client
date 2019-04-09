// Copyright 2019 Keybase, Inc. All rights reserved. Use of
// this source code is governed by the included BSD license.

package install

import (
	"github.com/keybase/client/go/launchd"
	"github.com/keybase/client/go/libkb"
)

func StopAllButService(mctx libkb.MetaContext) {
	g := mctx.G()
	mctx.Info("+ StopAllButService")
	if libkb.IsBrewBuild {
		launchd.Stop(DefaultServiceLabel(g.Env.GetRunMode()), defaultLaunchdWait, g.Log)
	}
	mctx.Info("StopAllButService: Terminating app")
	TerminateApp(g, g.Log)
	mctx.Info("StopAllButService: Terminating KBFS")
	UninstallKBFSOnStop(g, g.Log)
	mctx.Info("StopAllButService: Terminating updater")
	UninstallUpdaterService(g, g.Log)
	mctx.Info("StopAllButService: Terminating Keybase services")
	UninstallKeybaseServices(g, g.Log)
	mctx.Info("- StopAllButService")
}
