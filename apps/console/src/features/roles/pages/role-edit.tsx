/**
 * Copyright (c) 2020-2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RolesInterface } from "@wso2is/core/models";
import { TabPageLayout } from "@wso2is/react-components";
import { AxiosResponse } from "axios";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { AppConstants, AppState, FeatureConfigInterface, history } from "../../core";
import { EditRole } from "../../roles/components/edit-role/edit-role";
import { getRoleById } from "../api";

const RoleEditPage: FunctionComponent<any> = (): ReactElement => {

    const { t } = useTranslation();

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);

    const [ roleId, setRoleId ] = useState<string>(undefined);
    const [ roleObject, setRoleObject ] = useState<RolesInterface>();
    const [ isRoleDetailsRequestLoading, setIsRoleDetailsRequestLoading ] = useState<boolean>(false);

    const getRoleDetails = (roleId: string ): void => {
        setIsRoleDetailsRequestLoading(true);

        getRoleById(roleId)
            .then((response: AxiosResponse) => {
                if (response.status === 200) {
                    setRoleObject(response.data);
                }
            }).catch(() => {
                // TODO: handle error
            })
            .finally(() => {
                setIsRoleDetailsRequestLoading(false);
            });
    };

    const onRoleUpdate = (): void => {
        getRoleDetails(roleId);
    };

    /**
     * Get Role data from URL id
     */
    useEffect(() => {
        const path: string[] = history.location.pathname.split("/");
        const roleId: string = path[ path.length - 1 ];

        setRoleId(roleId);
        getRoleDetails(roleId);
    }, []);

    const handleBackButtonClick = () => {
        history.push(AppConstants.getPaths().get("ROLES"));
    };

    return (
        <TabPageLayout
            isLoading={ isRoleDetailsRequestLoading }
            title={
                roleObject && roleObject?.displayName ?
                    roleObject?.displayName :
                    t("console:manage.pages.rolesEdit.title")
            }
            pageTitle={ t("console:manage.pages.rolesEdit.title") }
            backButton={ {
                onClick: handleBackButtonClick,
                text: t("console:manage.pages.rolesEdit.backButton", { type: "roles" })
            } }
            titleTextAlign="left"
            bottomMargin={ false }
        >
            <EditRole
                isLoading={ isRoleDetailsRequestLoading }
                roleObject={ roleObject }
                roleId={ roleId }
                onRoleUpdate={ onRoleUpdate }
                featureConfig={ featureConfig }
            />
        </TabPageLayout>
    );
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default RoleEditPage;
