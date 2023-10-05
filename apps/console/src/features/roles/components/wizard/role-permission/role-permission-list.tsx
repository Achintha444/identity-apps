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

import { Chip, ListItemText } from "@oxygen-ui/react";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { SegmentedAccordion } from "@wso2is/react-components";
import { APIResourceInterface } from "apps/console/src/extensions/components/api-resources/models";
import React, { Fragment, FunctionComponent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "semantic-ui-react";
import { TreeNode } from "../../../models";

/**
 * Interface to capture permission list props
 */
interface RolePermissionListProp extends  IdentifiableComponentInterface {
    onSubmit?: (checkedPermission: TreeNode[]) => void;
    /**
     * Initial values of the form.
     */
    initialValues: any;
    /**
     * API resource list.
     */
    apiResourceList: APIResourceInterface[];
    /**
     * API resource list loading status.
     */
    apiResourceListLoading: boolean;
}

/**
 * Component to create the permission tree structure from the give permission list.
 */
export const RolePermissionList: FunctionComponent<RolePermissionListProp> = (props: RolePermissionListProp)
    : ReactElement => {

    const {
        initialValues,
        apiResourceList,
        apiResourceListLoading,
        [ "data-componentid" ]: componentid
    } = props;

    const { t } = useTranslation();

    /**
     * Get the permissions segmented accordion title.
     * 
     * @param apiDisplayName - API display name.
     * @returns Segmented accordion title.
     */
    const getPermissionsSegmentedAccordionTitle = (apiDisplayName: string): ReactElement =>
        (
            <ListItemText 
                primary={ apiDisplayName } 
                secondary={ (<Chip label="API Resource" />) } 
            />
        );

    /**
     * Render the API list with permissions.
     * 
     * @returns API list component.
     */
    const renderAPIList = (): ReactElement => {
        return (
            <Grid className="wizard-content-grid">
                <SegmentedAccordion
                    fluid
                    data-componentid={ `${ componentid }-permissions` }
                    className="nested-list-accordion"
                    viewType="table-view"
                >
                    {
                        apiResourceList?.map(
                            (api: APIResourceInterface) => {
                                return (
                                    <Fragment key={ api.id }>
                                        <SegmentedAccordion.Title
                                            id={ api.id }
                                            data-componentid={ `${componentid}-${api.id}-title` }
                                            active={ true }
                                            attached
                                            accordionIndex={ api.id }
                                            className="nested-list-accordion-title"
                                            onClick={ () => null }
                                            content={ 
                                                getPermissionsSegmentedAccordionTitle(api.name) 
                                            }
                                            type="checkbox popup"
                                        />
                                        <SegmentedAccordion.Content
                                            active={ true }
                                            className="nested-list-accordion-content-checkbox"
                                            data-componentid={ `${componentid}-${api.id}-content` }
                                        />
                                    </Fragment>
                                );
                            })
                    }
                </SegmentedAccordion>
            </Grid>
        );
    };

    return (
        <div data-componentid={ componentid }>
            { renderAPIList() }
        </div>
    );
};

/**
 * Default props for the component.
 */
RolePermissionList.defaultProps = {
    "data-componentid": "new-role-permissions-list"
};
