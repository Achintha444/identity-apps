/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
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

import { HttpMethods } from "@wso2is/core/models";
import useRequest, {
    RequestErrorInterface,
    RequestResultInterface
} from "apps/console/src/features/core/hooks/use-request";
import { AxiosRequestConfig } from "axios";
import { store } from "../../../../features/core/store";
import { APIResourcesListInterface } from "../models";

/**
 * Get API resources.
 *
 * @param after - after.
 * @param before - before.
 * @returns `Promise<APIResourcesListInterface>`
 * @throws `IdentityAppsApiException`
 */
export const useAPIResources = <Data = APIResourcesListInterface, Error = RequestErrorInterface>(
    after?: string,
    before?: string,
    filter?: string
): RequestResultInterface<Data, Error> => {

    const requestConfig: AxiosRequestConfig = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            after,
            before,
            filter
        },
        url: store.getState().config.endpoints.apiResources
    };

    const { data, error, isValidating, mutate } = useRequest<Data, Error>(requestConfig);

    return {
        data,
        error: error,
        isLoading: !error && !data,
        isValidating,
        mutate
    };
};
