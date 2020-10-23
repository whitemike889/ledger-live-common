// @flow

import { Observable, concat, from, of, throwError } from "rxjs";
import { concatMap, catchError, delay } from "rxjs/operators";
import {
  TransportStatusError,
  DeviceOnDashboardExpected,
} from "@ledgerhq/errors";
import type { DeviceInfo } from "../types/manager";
import type { ListAppsEvent } from "../apps";
import { listApps } from "../apps/hw";
import { withDevice } from "./deviceAccess";
import getDeviceInfo from "./getDeviceInfo";

export type Input = {
  devicePath: string,
};

export type ConnectManagerEvent =
  | { type: "appDetected" }
  | { type: "unresponsiveDevice" }
  | { type: "osu", deviceInfo: DeviceInfo }
  | { type: "bootloader", deviceInfo: DeviceInfo }
  | { type: "listingApps", deviceInfo: DeviceInfo }
  | ListAppsEvent;

const cmd = ({ devicePath }: Input): Observable<ConnectManagerEvent> =>
  withDevice(devicePath)((transport) =>
    Observable.create((o) => {
      const timeoutSub = of({ type: "unresponsiveDevice" })
        .pipe(delay(1000))
        .subscribe((e) => o.next(e));

      const sub = from(getDeviceInfo(transport))
        .pipe(
          concatMap((deviceInfo) => {
            timeoutSub.unsubscribe();

            if (deviceInfo.isBootloader) {
              return of({ type: "bootloader", deviceInfo });
            }

            if (deviceInfo.isOSU) {
              return of({ type: "osu", deviceInfo });
            }

            return concat(
              of({ type: "listingApps", deviceInfo }),
              listApps(transport, deviceInfo)
            );
          }),
          catchError((e: Error) => {
            if (
              e instanceof DeviceOnDashboardExpected ||
              (e &&
                e instanceof TransportStatusError &&
                [0x6e00, 0x6d00, 0x6e01, 0x6d01, 0x6d02].includes(e.statusCode))
            ) {
              return of({ type: "appDetected" });
            }
            return throwError(e);
          })
        )
        .subscribe(o);

      return () => {
        timeoutSub.unsubscribe();
        sub.unsubscribe();
      };
    })
  );

export default cmd;