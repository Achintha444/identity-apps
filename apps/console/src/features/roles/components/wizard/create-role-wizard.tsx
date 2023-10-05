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

import { AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { useTrigger } from "@wso2is/forms";
import { Heading, LinkButton, PrimaryButton, Steps } from "@wso2is/react-components";
import { AxiosError, AxiosResponse } from "axios";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { Grid, Icon, Modal } from "semantic-ui-react";
import { RoleBasics } from "./role-basics";
import { AppConstants } from "../../../core/constants";
import { history } from "../../../core/helpers";
import { createRole } from "../../api";
import { getRolesWizardStepIcons } from "../../configs";
import { CreateRoleFormData, CreateRoleInterface, TreeNode } from "../../models";
import { RolePermissions } from "./role-permission/role-permissions";
import { WizardStateInterface, WizardStepsFormTypes } from "../../models/roles";

/**
 * Interface which captures create role props.
 */
interface CreateRoleProps extends IdentifiableComponentInterface {
    closeWizard: () => void;
    updateList: () => void;
    onCreateRoleRequested?: (role: CreateRoleInterface) => void;
    isAddGroup: boolean;
    initStep?: number;
}

/**
 * Component to handle addition of a new role to the system.
 *
 * @param props - props related to the create role wizard
 */
export const CreateRoleWizard: FunctionComponent<CreateRoleProps> = (props: CreateRoleProps): ReactElement => {

    const {
        closeWizard,
        initStep,
        updateList,
        isAddGroup,
        onCreateRoleRequested,
        [ "data-componentid" ]: componentId
    } = props;

    const { t } = useTranslation();
    const dispatch: Dispatch = useDispatch();

    // External trigger to submit the basic step. 
    let submitRoleBasic: () => void;

    const [ currentStep, setCurrentWizardStep ] = useState<number>(initStep);
    const [ partiallyCompletedStep, setPartiallyCompletedStep ] = useState<number>(undefined);
    const [ wizardState, setWizardState ] = useState<WizardStateInterface>(undefined);
    const [ isEnded, setEnded ] = useState<boolean>(false);
    const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
    const [ isPreviousDisabled, setIsPreviousDisabled ] = useState<boolean>(false);

    const [ submitPermissionList, setSubmitPermissionList ] = useTrigger();
    const [ finishSubmit, setFinishSubmit ] = useTrigger();

    /**
     * Sets the current wizard step to the previous on every `partiallyCompletedStep`
     * value change , and resets the partially completed step value.
     */
    useEffect(() => {
        if (partiallyCompletedStep === undefined) {
            return;
        }

        setCurrentWizardStep(currentStep - 1);
        setPartiallyCompletedStep(undefined);
    }, [ partiallyCompletedStep ]);

    useEffect(() => {
        if(!isEnded) {
            return;
        }

        if (wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]) {
            //addRole(wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]);
        }
    }, [ wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ] ]);

    // /**
    //  * Method to handle create role action when create role wizard finish action is triggered.
    //  *
    //  * @param basicData - basic data required to create role.
    //  */
    // const addRole = (basicData: CreateRoleFormData): void => {
    //     const permissions: string[] = [];

    //     if (basicData?.PermissionList?.length > 0) {
    //         basicData?.PermissionList?.forEach((permission: TreeNode) => {
    //             permissions?.push(permission?.key.toString());
    //         });
    //     }

    //     const roleData: CreateRoleInterface = {
    //         "displayName": basicData?.BasicDetails ? basicData?.BasicDetails?.roleName : basicData?.roleName,
    //         "permissions": permissions,
    //         "schemas": [
    //             "urn:ietf:params:scim:schemas:extension:2.0:Role"
    //         ]
    //     };

    //     setIsSubmitting(true);

    //     if (onCreateRoleRequested) {
    //         onCreateRoleRequested(roleData);
    //     } else {
    //         // Create Role API Call.
    //         createRole(roleData).then((response: AxiosResponse) => {
    //             if (response.status === 201) {
    //                 dispatch(
    //                     addAlert({
    //                         description: t("console:manage.features.roles.notifications.createRole." +
    //                             "success.description"),
    //                         level: AlertLevels.SUCCESS,
    //                         message: t("console:manage.features.roles.notifications.createRole.success.message")
    //                     })
    //                 );

    //                 closeWizard();
    //                 history.push(AppConstants.getPaths().get("ROLE_EDIT").replace(":id", response.data.id));
    //             }

    //         }).catch((error: AxiosError) => {
    //             if (!error.response || error.response.status === 401) {
    //                 closeWizard();
    //                 dispatch(
    //                     addAlert({
    //                         description: t("console:manage.features.roles.notifications.createRole.error.description"),
    //                         level: AlertLevels.ERROR,
    //                         message: t("console:manage.features.roles.notifications.createRole.error.message")
    //                     })
    //                 );
    //             } else if (error.response && error.response.data.detail) {
    //                 closeWizard();
    //                 dispatch(
    //                     addAlert({
    //                         description: t("console:manage.features.roles.notifications.createRole.error.description",
    //                             { description: error.response.data.detail }),
    //                         level: AlertLevels.ERROR,
    //                         message: t("console:manage.features.roles.notifications.createRole.error.message")
    //                     })
    //                 );
    //             } else {
    //                 closeWizard();
    //                 dispatch(addAlert({
    //                     description: t("console:manage.features.roles.notifications.createRole." +
    //                         "genericError.description"),
    //                     level: AlertLevels.ERROR,
    //                     message: t("console:manage.features.roles.notifications.createRole.genericError.message")
    //                 }));
    //             }
    //         }).finally(() => {
    //             setIsSubmitting(false);
    //         });
    //     }
    // };

    /**
     * Method to handle the create role wizard finish action.
     *
     */
    const handleRoleWizardFinish = () => {
        //addRole(wizardState);
    };

    /**
     * Handles wizard step submit.
     *
     * @param values - Forms values to be stored in state.
     * @param formType - Type of the form.
     */
    const handleWizardSubmit = (values: CreateRoleFormData | TreeNode[], formType: WizardStepsFormTypes) => {
        setCurrentWizardStep(currentStep + 1);

        setWizardState({ ...wizardState, [ formType ]: values });
    };

    // Create role wizard steps
    const WIZARD_STEPS: ({
        content: JSX.Element;
        icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        title: string;
    } | {
        content: JSX.Element;
        icon: JSX.Element;
        title: string;
    })[] = [ 
        {
            content: (
                <RoleBasics
                    triggerSubmission={ (submitFunctionCb: () => void) => {
                        submitRoleBasic = submitFunctionCb;
                    } }
                    setIsPreviousDisabled={ setIsPreviousDisabled }
                    initialValues={ wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ] }
                    onSubmit={ (values: CreateRoleFormData) => 
                        handleWizardSubmit(values, WizardStepsFormTypes.BASIC_DETAILS) }
                />
            ),
            icon: getRolesWizardStepIcons().general,
            title: t("console:manage.features.roles.addRoleWizard.wizardSteps.0")
        },
        {
            content: (
                <RolePermissions
                    initialValues={ wizardState && wizardState[ WizardStepsFormTypes.PERM_LIST ] }
                    roleAudience = { wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]?.roleAudience }
                    assignedApplication = { 
                        wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]?.assignedApplication
                    }
                    onSubmit={ (values: TreeNode[]) => handleWizardSubmit(values, WizardStepsFormTypes.PERM_LIST) }
                />
            ),
            icon: <Icon name="key" inverted size="large" />,
            title: t("console:manage.features.roles.addRoleWizard.wizardSteps.1")
        }
    ];

    /**
     * Function to change the current wizard step to next.
     */
    const changeStepToNext = (): void => {

        switch(currentStep) {
            case 0:
                submitRoleBasic();

                break;
            case 1:
                setSubmitPermissionList();
                setFinishSubmit();

                break;
        }
    };

    const navigateToPrevious = () => {
        setPartiallyCompletedStep(currentStep);
    };

    const handleFinishFlow = () => {
        setEnded(true);
    };

    return (
        <Modal
            open={ true }
            className="wizard create-role-wizard"
            dimmer="blurring"
            size="small"
            onClose={ closeWizard }
            closeOnDimmerClick={ false }
            closeOnEscape= { false }
            data-componentId={ componentId }
        >
            <Modal.Header className="wizard-header">
                { t("console:manage.features.roles.addRoleWizard.heading", { type: "Role" }) }
                {
                    wizardState && wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]?.roleName
                        ? " - " + wizardState[ WizardStepsFormTypes.BASIC_DETAILS ]?.roleName
                        : ""
                }
                <Heading as="h6">
                    {
                        t("console:manage.features.roles.addRoleWizard.subHeading", { type: "role" })
                    }
                </Heading>
            </Modal.Header>
            <Modal.Content className="steps-container">
                <Steps.Group
                    current={ currentStep }
                >
                    { WIZARD_STEPS.map((
                        step: {
                            content: JSX.Element;
                            icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
                            title: string;
                        } | {
                            content: JSX.Element;
                            icon: JSX.Element;
                            title: string;
                        },
                        index: number
                    ) => (
                        <Steps.Step
                            key={ index }
                            icon={ step.icon }
                            title={ step.title }
                        />
                    )) }
                </Steps.Group>
            </Modal.Content>
            <Modal.Content className="content-container" scrolling>
                { WIZARD_STEPS[ currentStep ].content }
            </Modal.Content>
            <Modal.Actions>
                <Grid>
                    <Grid.Row column={ 1 }>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            <LinkButton
                                floated="left"
                                onClick={ () => closeWizard() }
                                data-componentId={ `${ componentId }-cancel-button` }
                            >
                                { t("common:cancel") }
                            </LinkButton>
                        </Grid.Column>
                        <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                            { currentStep < WIZARD_STEPS.length - 1 && (
                                <PrimaryButton
                                    floated="right"
                                    onClick={ changeStepToNext }
                                    data-componentId={ `${ componentId }-next-button` }
                                    disabled={ isPreviousDisabled }
                                >
                                    { t("console:manage.features.roles.addRoleWizard.buttons.next") }
                                    <Icon name="arrow right" data-componentId={ `${ componentId }-next-button-icon` }/>
                                </PrimaryButton>
                            ) }
                            { currentStep === WIZARD_STEPS.length - 1 && (
                                <PrimaryButton
                                    floated="right"
                                    onClick={ changeStepToNext }
                                    loading={ isSubmitting }
                                    disabled={ isSubmitting }
                                    data-componentId={ `${ componentId }-finish-button` }
                                >
                                    { t("console:manage.features.roles.addRoleWizard.buttons.finish") }
                                </PrimaryButton>
                            ) }
                            { currentStep > 0 && (
                                <LinkButton
                                    floated="right"
                                    onClick={ navigateToPrevious }
                                    data-componentId={ `${ componentId }-previous-button` }
                                >
                                    <Icon 
                                        name="arrow left" 
                                        data-componentId={ `${ componentId }-previous-button-icon` }
                                    />
                                    { t("console:manage.features.roles.addRoleWizard.buttons.previous") }
                                </LinkButton>
                            ) }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Modal.Actions>
        </Modal>
    );
};

/**
 * Default props for Create role wizard component.
 * NOTE : Current step is set to 0 in order to start from
 *        beginning of the wizard.
 */
CreateRoleWizard.defaultProps = {
    "data-componentid": "role-mgt-create-role-wizard",
    initStep: 0
};
