/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { RoleAudiences } from "../models";

export const APPLICATION_DOMAIN: string = "Application/";
export const INTERNAL_DOMAIN: string = "Internal";
export const PRIMARY_DOMAIN: string = "Primary";
export const ROLE_VIEW_PATH: string = "/roles/";

/**
 * Class containing role constants.
 */
export class RoleConstants {

    /**
     * Private constructor to avoid object instantiation from outside
     * the class.
     */
    private constructor() { }

    /**
     * Set of keys used to enable/disable features.
     */
    public static readonly FEATURE_DICTIONARY: Map<string, string> = new Map<string, string>()
        .set("ROLE_CREATE", "roles.create")
        .set("ROLE_UPDATE", "roles.update")
        .set("ROLE_DELETE", "roles.delete")
        .set("ROLE_READ", "roles.read");

    public static readonly SUPER_ADMIN_PERMISSION_KEY: string = "/permission/protected";
    /**
     * Number of role audiences.
     */
    public static readonly NUMBER_OF_AUDIENCES: number = 2;
    public static readonly MAX_ROLE_NAME_LENGTH: number = 255;
    public static readonly MIN_ROLE_NAME_LENGTH: number = 3;
    /**
     * Client ids of applications which are not allowed to be assigned to roles.
     */
    public static readonly READONLY_APPLICATIONS_CLIENT_IDS: string[] = [
        "CONSOLE",
        "MY_ACCOUNT"
    ];

    /**
     * Default role audience.
     */
    public static readonly DEFAULT_ROLE_AUDIENCE: RoleAudiences = RoleAudiences.ORG;
    /**
     * Default application search debounce timeout.
     */
    public static readonly DEBOUNCE_TIMEOUT: number = 1000;
}
