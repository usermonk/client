// Copyright 2019 Keybase, Inc. All rights reserved. Use of
// this source code is governed by the included BSD license.

// +build !windows,!darwin

package install

import (
	"context"
	"fmt"
	"os/exec"
	"time"

	"github.com/keybase/client/go/libkb"
	keybase1 "github.com/keybase/client/go/protocol/keybase1"
)

func StopAllButService(mctx libkb.MetaContext, exitCode keybase1.ExitCode) {
	clients := libkb.GetClientStatus(mctx)
	for _, client := range clients {
		if client.Details.ClientType == keybase1.ClientType_CLI {
			continue
		}

		// NOTE KBFS catches the SIGTERM and attempts to unmount mountdir before terminating,
		//      so we don't have to do it ourselves.
		// NOTE We kill the GUI by its main electron process ID, which should
		//      shut down its child processes.
		err := stopPID(mctx, client.Details.Pid, exitCode)
		if err != nil {
			mctx.Debug("Error killing client %+v: %s", client, err)
		}
	}

	if mctx.G().Env.GetRunMode() == libkb.ProductionRunMode {
		// NOTE killall only inspects the first 15 characters; we need to use pkill -f
		err := stopProcessInexactMatch(mctx, "keybase-redirector", exitCode)
		if err != nil {
			mctx.Debug("Error killing keybase-redirector: %s", err)
		}
	}
}

func exitCodeArg(exitCode keybase1.ExitCode) string {
	return fmt.Sprintf("-%d", exitCode)
}

func stopProcessInexactMatch(mctx libkb.MetaContext, process string, exitCode keybase1.ExitCode) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	output, err := exec.CommandContext(ctx, "pkill", exitCodeArg(exitCode), "-f", process).CombinedOutput()
	mctx.Debug("Output (pkill -f %s): %s", process, string(output), err)
	return err
}

func stopPID(mctx libkb.MetaContext, pid int, exitCode keybase1.ExitCode) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	output, err := exec.CommandContext(ctx, "kill", exitCodeArg(exitCode), fmt.Sprintf("%d", pid)).CombinedOutput()
	mctx.Debug("Output (kill %s): %s", pid, string(output), err)
	return err
}
