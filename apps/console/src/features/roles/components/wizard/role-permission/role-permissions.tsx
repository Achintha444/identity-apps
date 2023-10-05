/**
 * Copyright (c) 2020-2023, WSO2 LLC. (https://www.wso2.com).
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

import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { useAPIResources } from "apps/console/src/extensions/components/api-resources/api/api-resources-new";
import React, { FunctionComponent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useAuthorizedAPIList } from "../../../api/roles";
import { TreeNode } from "../../../models";

/**
 * Interface to capture permission list props
 */
interface RolePermissionsProp extends  IdentifiableComponentInterface {
    onSubmit?: (checkedPermission: TreeNode[]) => void;
    /**
     * Initial values of the form.
     */
    initialValues: any;
    /**
     * Audience of the role.
     */
    roleAudience: string;
    /**
     * Assigned application.
     */
    assignedApplication: string;
}

/**
 * Component to create the permission tree structure from the give permission list.
 */
export const RolePermissions: FunctionComponent<RolePermissionsProp> = (props: RolePermissionsProp): ReactElement => {

    const {
        onSubmit,
        initialValues,
        roleAudience,
        assignedApplication,
        [ "data-componentid" ]: componentid
    } = props;

    const { t } = useTranslation();

    const {
        data: authorizedAPIResourceList,
        isLoading: isAPIResourceListRequestLoading,
        error: authorizedAPIResourceListRequestError,
        mutate: mutateAuthorizedAPIResourceList
    } = useAuthorizedAPIList(assignedApplication);

    const {
        data: apiResourceList,
        isLoading: isAPIResourceListLoading,
        error: aPIResourceListRequestError,
        mutate: mutateAPIResourceList
    } = useAPIResources();

    return (
        <div data-componentid={ componentid }>
            
        </div>
    );
};

/**
 * Default props for the component.
 */
RolePermissions.defaultProps = {
    "data-componentid": "new-role-permissions"
};
