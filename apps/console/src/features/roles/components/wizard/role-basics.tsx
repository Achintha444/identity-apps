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


import { Alert, ListItemText } from "@oxygen-ui/react";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { Field, Form } from "@wso2is/form";
import { Link } from "@wso2is/react-components";
import { AxiosResponse } from "axios";
import debounce, { DebouncedFunc } from "lodash-es/debounce";
import isEmpty from "lodash-es/isEmpty";
import React, { 
    FunctionComponent, 
    MutableRefObject, 
    ReactElement, 
    SyntheticEvent, 
    useCallback, 
    useEffect, 
    useRef, 
    useState 
} from "react";
import { Trans, useTranslation } from "react-i18next";
import { DropdownProps } from "semantic-ui-react";
import { history } from "../../../../features/core";
import { useApplicationList } from "../../../applications/api/application";
import { ApplicationListItemInterface } from "../../../applications/models";
import { AppConstants, SharedUserStoreConstants } from "../../../core/constants";
import { SharedUserStoreUtils } from "../../../core/utils";
import { searchRoleList } from "../../api/roles";
import { PRIMARY_DOMAIN, RoleConstants } from "../../constants";
import { CreateRoleFormData, RoleAudiences, SearchRoleInterface } from "../../models";

/**
 * Interface to capture role basics props.
 */
interface RoleBasicProps extends IdentifiableComponentInterface {
    dummyProp?: string;
    /**
     * Initial values of the form.
     */
    initialValues: CreateRoleFormData;
    /**
     * Trigger submission
     */
    triggerSubmission: (submitFunctionCb: () => void) => void;
    /**
     * On submit callback.
     */
    onSubmit: (values: CreateRoleFormData) => void;
    /**
     * Set whether the next button is disabled.
     */
    setIsPreviousDisabled: (isDisabled: boolean) => void;
}

/**
 * Component to capture basic details of a new role.
 *
 * @param props - Role Basic prop types
 */
export const RoleBasics: FunctionComponent<RoleBasicProps> = (props: RoleBasicProps): ReactElement => {

    const {
        onSubmit,
        triggerSubmission,
        initialValues,
        setIsPreviousDisabled,
        [ "data-componentid" ]: componentId
    } = props;

    const userStore: string = SharedUserStoreConstants.PRIMARY_USER_STORE;

    const { t } = useTranslation();

    const [ isRoleNamePatternValid, setIsRoleNamePatternValid ] = useState<boolean>(true);
    const [ isRegExLoading, setRegExLoading ] = useState<boolean>(false);
    const [ roleAudience, setRoleAudience ] = useState<string>(
        initialValues?.roleAudience 
            ? initialValues.roleAudience 
            : RoleConstants.DEFAULT_ROLE_AUDIENCE
    );
    const [ isDisplayApplicationList, setIsDisplayApplicationList ] = useState<boolean>(false);
    const [ isDisplayNoAppScopeApplicatioError, setIsDisplayNoAppScopeApplicatioError ] = useState<boolean>(false);
    const [ applicationSearchQuery, setApplicationSearchQuery ] = useState<string>(undefined);
    const [ assignedApplicationsSearching, setAssignedApplicationsSearching ] = useState<boolean>(false);
    const [ applicationListOptions, setApplicationListOptions ] = useState<DropdownProps[]>([]);

    const isNoApplicationsAvailableUpdated: MutableRefObject<boolean> = useRef<boolean>(false);
    const noApplicationsAvailable: MutableRefObject<boolean> = useRef<boolean>(false);

    const {
        data: applicationList,
        isLoading: isApplicationListFetchRequestLoading,
        isValidating: isApplicationListFetchRequestValidating,
        error: applicationListFetchRequestError,
        mutate: mutateApplicationListFetchRequest
    } = useApplicationList("clientId", null, null, applicationSearchQuery);

    useEffect(() => {
        if (roleAudience === RoleAudiences.APPLICATION && noApplicationsAvailable.current) {
            setIsPreviousDisabled(true);
        } else {
            setIsPreviousDisabled(false);
        }

        if (roleAudience !== RoleAudiences.APPLICATION || noApplicationsAvailable.current) {
            setIsDisplayApplicationList(false);
        } else {
            setIsDisplayApplicationList(true);
            setIsPreviousDisabled(false);
        }

        // Setting is display no app scope application error flag.
        if(( applicationListFetchRequestError || noApplicationsAvailable.current) 
            && roleAudience === RoleAudiences.APPLICATION 
            && ( !applicationSearchQuery || applicationSearchQuery === "" )) 
        {
            setIsDisplayNoAppScopeApplicatioError(true);
        } else {
            setIsDisplayNoAppScopeApplicatioError(false);
        }
    }, [ applicationList, applicationListFetchRequestError, roleAudience ]);

    useEffect(() => {
        const options: DropdownProps[] = [];

        applicationList?.applications?.map((application: ApplicationListItemInterface) => {
            if (!RoleConstants.READONLY_APPLICATIONS_CLIENT_IDS.includes(application?.clientId)) {
                options.push({
                    content: (
                        <ListItemText 
                            primary={ application.name } 
                            secondary={ t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." + 
                                "assignedApplication.applicationSubTitle.application") } 
                        />
                    ),
                    key: application.id,
                    text: application.name,
                    value: application.id
                });
            }
        });

        if (options.length === 0 && !(isNoApplicationsAvailableUpdated.current)) {
            noApplicationsAvailable.current = true;
        } else {
            noApplicationsAvailable.current = false;
        }

        if(!isApplicationListFetchRequestValidating) {
            isNoApplicationsAvailableUpdated.current = true;
        }

        setApplicationListOptions(options);
    }, [ applicationList ]);

    /**
     * The following function validates role name against the user store regEx.
     *
     * @param roleName - User input role name
     */
    const validateRoleNamePattern = async (roleName: string): Promise<void> => {
        let userStoreRegEx: string = "";

        if (userStore !== PRIMARY_DOMAIN) {
            await SharedUserStoreUtils.getUserStoreRegEx(
                userStore,
                SharedUserStoreConstants.USERSTORE_REGEX_PROPERTIES.RolenameRegEx
            )
                .then((response: string) => {
                    setRegExLoading(true);
                    userStoreRegEx = response;
                });
        } else {
            userStoreRegEx = SharedUserStoreConstants.PRIMARY_USERSTORE_PROPERTY_VALUES.RolenameJavaScriptRegEx;
        }
        setIsRoleNamePatternValid(SharedUserStoreUtils.validateInputAgainstRegEx(roleName, userStoreRegEx));
    };

    /**
     * Util method to collect form data for processing.
     *
     * @param values - contains values from form elements
     */
    const getFormValues = (values: CreateRoleFormData): CreateRoleFormData => {
        return {
            assignedApplication: values.roleAudience === RoleAudiences.APPLICATION 
                ? values.assignedApplication.toString()
                : null,
            roleAudience: values.roleAudience.toString(),
            roleName: values.roleName.toString()
        };
    };

    /**
     * The following function handles the search query for the groups list.
     */
    const searchApplications: DebouncedFunc<(query: string) => void> = 
        useCallback(debounce((query: string) => {
            query = !isEmpty(query) ? query : null;
            setApplicationSearchQuery(query ? `name co ${query}` : null);
            mutateApplicationListFetchRequest().finally(() => {
                setAssignedApplicationsSearching(false);
            });
        }, RoleConstants.DEBOUNCE_TIMEOUT), []);

    /**
     * Navigate to the API Resources page.
     */
    const navigateToApplications = () => history.push(AppConstants.getPaths().get("APPLICATIONS"));

    /**
     * Validates the Form.
     *
     * @param values - Form Values.
     * @returns Form validation.
     */
    const validateForm = async (values: CreateRoleFormData): Promise<CreateRoleFormData>=> {

        const errors: CreateRoleFormData = {
            assignedApplication: undefined,
            roleName: undefined
        };

        // Handle the case where the user has not selected an assigned application.
        if (roleAudience === RoleAudiences.APPLICATION && !values.assignedApplication?.toString().trim()) {
            errors.assignedApplication = t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." +
                "assignedApplication.validations.empty", { type: "Role" });
        }
        
        // Handle the case where the user has not entered a role name.
        if (!values.roleName?.toString().trim()) {
            errors.roleName = t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.roleName." +
                "validations.empty", { type: "Role" });
        } else {
            const searchData: SearchRoleInterface = {
                filter: "displayName eq " + values.roleName.toString(),
                schemas: [
                    "urn:ietf:params:scim:api:messages:2.0:SearchRequest"
                ],
                startIndex: 1
            };
            const response: AxiosResponse = await searchRoleList(searchData);
    
            if (response?.data?.totalResults > 0) {
                errors.roleName = t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." +
                        "roleName.validations.duplicate", { type: "Role" });
                
                await validateRoleNamePattern(values.roleName?.toString());
    
                if (!isRoleNamePatternValid) {
                    errors.roleName = t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." +
                        "roleName.validations.invalid", { type: "role" });
                }
            }    
        }

        return errors;
    };

    return (
        <Form
            data-testid={ componentId }
            data-componentid={ componentId }
            onSubmit={ (values: CreateRoleFormData) => {
                onSubmit(getFormValues(values));
            } }
            triggerSubmit={ (submitFunction: () => void) => triggerSubmission(submitFunction) }
            id={ "" }
            uncontrolledForm={ true }
            validateOnBlur={ true }
            validate={ validateForm }
            initialValues={ initialValues }
        >
            <Field.Input
                ariaLabel="roleName"
                inputType="resource_name"
                data-testid={ `${ componentId }-role-name-input` }
                data-componentid={ `${ componentId }-role-name-input` }
                type="text"
                name="roleName"
                maxLength={ RoleConstants.MAX_ROLE_NAME_LENGTH }
                minLength={ RoleConstants.MIN_ROLE_NAME_LENGTH }
                label={
                    t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." +
                        "roleName.label",{ type: "Role" })
                }
                placeholder={
                    t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.roleName." +
                        "placeholder", { type: "Role" })
                }
                required={ true }
                loading={ isRegExLoading }
            />
            <div className="ui form required field">
                <label>
                    { t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.roleAudience.label") }
                </label>
                {
                    Object.values(RoleAudiences)
                        .map((audience: string, index: number) => (
                            <Field.Radio
                                key={ index }
                                ariaLabel="roleAudience"
                                name="roleAudience"
                                label={ t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." + 
                                    `roleAudience.values.${audience.toLowerCase()}`) }
                                required={ false }
                                readOnly={ false }
                                value={ audience }
                                defaultValue={ RoleConstants.DEFAULT_ROLE_AUDIENCE }
                                data-componentid={ `${componentId}-${audience}-audience` }
                                listen={ () => setRoleAudience(audience) }
                                hint={ 
                                    index === RoleConstants.NUMBER_OF_AUDIENCES - 1 
                                        ? (
                                            <Trans 
                                                i18nKey= { "console:manage.features.roles.addRoleWizard.forms." + 
                                                    "roleBasicDetails.roleAudience.hint" }>
                                                Set the audience of the role.
                                                <b>Note that audience of the role cannot be changed.</b>
                                            </Trans>
                                        ) 
                                        : null 
                                        // TODO: need to add a learn more for this.
                                }
                            />
                        ))
                }
            </div>
            {
                !isDisplayNoAppScopeApplicatioError
                    ? (
                        <Alert severity="info">
                            {
                                roleAudience === RoleAudiences.ORG
                                    ? t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.notes" + 
                                        ".orgNote")
                                    : t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.notes" + 
                                        ".appNote")
                                // TODO: need to add a learn more for this.
                            }
                        </Alert>
                    )
                    : null
            }
            {
                isDisplayNoAppScopeApplicatioError
                    ? (
                        <Alert severity="error">
                            <Trans 
                                i18nKey= { "console:manage.features.roles.addRoleWizard.forms.roleBasicDetails.notes" + 
                                    ".cannotCreateRole" }>
                            You cannot create an application-scoped role because there are currently no applications 
                            that support application-scoped role. Please (
                                <Link
                                    data-componentid={ `${componentId}-link-api-resource-page` }
                                    onClick={ navigateToApplications }
                                    external={ false }
                                >
                                    create an application
                                </Link>
                            )
                            that supports application-scoped roles to proceed.
                            </Trans>
                        </Alert>
                    )
                    : null
            }
            {
                isDisplayApplicationList
                    ? (
                        <Field.Dropdown
                            ariaLabel="assignedApplication"
                            name="assignedApplication"
                            label={ t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." + 
                                "assignedApplication.label") }
                            options={ applicationListOptions }
                            required={ isDisplayApplicationList }
                            value={ initialValues?.assignedApplication }
                            search
                            loading = { isApplicationListFetchRequestLoading || assignedApplicationsSearching }
                            data-componentid={ `${componentId}-typography-font-family-dropdown` }
                            hint={ t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." + 
                                    "assignedApplication.hint") }
                            placeholder={ t("console:manage.features.roles.addRoleWizard.forms.roleBasicDetails." + 
                                "assignedApplication.placeholder") }
                            noResultsMessage={
                                isApplicationListFetchRequestLoading || assignedApplicationsSearching
                                    ? t("common:searching")
                                    : t("common:noResultsFound")
                            }
                            onSearchChange={ (
                                value: SyntheticEvent<HTMLElement>,
                                data: DropdownProps
                            ) => {
                                setAssignedApplicationsSearching(true);
                                searchApplications(data.searchQuery.toString());
                            } }
                        />
                    )
                    : null
            }
        </Form>
    );
};

/**
 * Default props for the component.
 */
RoleBasics.defaultProps = {
    "data-componentid": "add-role-basics-form"
};
