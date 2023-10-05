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

import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { CommonUtils } from "@wso2is/core/utils";
import { Field, Form } from "@wso2is/form";
import { Hint } from "@wso2is/react-components";
import isEmpty from "lodash-es/isEmpty";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "semantic-ui-react";
import {
    ConnectorPropertyInterface,
    GovernanceConnectorInterface,
    ServerConfigurationsConstants
} from "../../../../features/server-configurations";
import { GovernanceConnectorConstants } from "../constants/governance-connector-constants";
import { AnalyticsAPIRequestInterface, AnalyticsFormValuesInterface } from "../models/analytics";

/**
 * Interface for Password Recovery Configuration Form props.
 */
interface AnalyticsConfigurationFormPropsInterface extends IdentifiableComponentInterface {
    /**
     * Connector's initial values.
     */
    initialValues: GovernanceConnectorInterface;
    /**
     * Callback for form submit.
     * @param values - Resolved Form Values.
     */
    onSubmit: (values) => void;
    /**
     * Is readonly.
     */
    readOnly?: boolean;
    /**
     * Whether the connector is enabled using the toggle button.
     */
    isConnectorEnabled?: boolean;
    /**
     * Specifies if the form is submitting.
     */
    isSubmitting?: boolean;
}

const FORM_ID: string = "governance-connectors-analytics-form";

/**
 * Analytics Configuration Form.
 *
 * @param props - Props injected to the component.
 * @returns Functional component.
 */
export const AnalyticsConfigurationForm: FunctionComponent<AnalyticsConfigurationFormPropsInterface> = (
    props: AnalyticsConfigurationFormPropsInterface
): ReactElement => {

    const {
        initialValues,
        onSubmit,
        readOnly,
        isConnectorEnabled,
        isSubmitting,
        ["data-componentid"]: componentId
    } = props;

    const { t } = useTranslation();
    const [ initialConnectorValues, setInitialConnectorValues ]
        = useState<AnalyticsFormValuesInterface>(undefined);

    /**
     * Flattens and resolved form initial values and field metadata.
     */
    useEffect(() => {
        if (isEmpty(initialValues?.properties)) {
            return;
        }

        let resolvedInitialValues: AnalyticsFormValuesInterface = null;

        initialValues.properties.map((property: ConnectorPropertyInterface) => {
            switch (property.name) {
                case ServerConfigurationsConstants.ANALYTICS_HOST:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        receiver: property.value
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_BASIC_AUTH_ENABLE:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        basicAuthEnabled: CommonUtils.parseBoolean(property.value)
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_BASIC_AUTH_USERNAME:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        basicAuthUsername: property.value
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_BASIC_AUTH_PASSWORD:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        basicAuthPassword: property.value
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_HTTP_CONNECTION_TIMEOUT:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        httpConnectionTimeout: parseInt(property.value)
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_HTTP_READ_TIMEOUT:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        httpReadTimeout: parseInt(property.value)
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_HTTP_CONNECTION_REQUEST_TIMEOUT:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        httpConnectionRequestTimeout: parseInt(property.value)
                    };

                    break;
                case ServerConfigurationsConstants.ANALYTICS_HOSTNAME_VERIFICATION:
                    resolvedInitialValues = {
                        ...resolvedInitialValues,
                        hostNameVerfier: property.value
                    };

                    break;

            }
        });
        setInitialConnectorValues(resolvedInitialValues);        
    }, [ initialValues ]);

    /**
     * Prepare form values for submitting.
     *
     * @param values - Form values.
     * @returns Sanitized form values.
     */
    const getUpdatedConfigurations = (values: AnalyticsFormValuesInterface): AnalyticsAPIRequestInterface => {
        const data: AnalyticsAPIRequestInterface = {
            "__secret__adaptive_authentication.elastic.basicAuth.password": values.basicAuthPassword,
            "adaptive_authentication.elastic.HTTPConnectionRequestTimeout": values.httpConnectionRequestTimeout,
            "adaptive_authentication.elastic.HTTPConnectionTimeout": values.httpConnectionTimeout,
            "adaptive_authentication.elastic.HTTPReadTimeout": values.httpReadTimeout,
            "adaptive_authentication.elastic.basicAuth.enabled": values.basicAuthEnabled,
            "adaptive_authentication.elastic.basicAuth.username": values.basicAuthUsername,
            "adaptive_authentication.elastic.hostnameVerfier": values.hostNameVerfier,
            "adaptive_authentication.elastic.receiver": values.receiver
        };

        return data;
    };

    if (!initialConnectorValues) {
        return null;
    }

    return (
        <div className={ "connector-form" }>
            <Form
                id={ FORM_ID }
                initialValues={ initialConnectorValues }
                onSubmit={ (values: any) => onSubmit(getUpdatedConfigurations(values)) }
                uncontrolledForm={ false }
            >
                <Field.Input
                    ariaLabel="Analytics Host URL"
                    inputType="default"
                    name="receiver"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostUrl.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostUrl.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ null }
                    readOnly={ readOnly }
                    width={ 12 }
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-analytics-host-url` }
                />
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostUrl.hint")
                    }
                </Hint>
                <Field.Checkbox
                    ariaLabel="Analytics Enable Basic Auth"
                    name="basicAuthEnabled"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostBasicAuthEnable.label") }
                    required={ false }
                    readOnly={ readOnly }
                    width={ 12 }
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-analytics-success` }
                />
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostBasicAuthEnable.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics Host Username"
                    inputType="default"
                    name="basicAuthUsername"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostUsername.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostUsername.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ null }
                    readOnly={ readOnly }
                    width={ 12 }
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-username` }
                />
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostUsername.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics Host Password"
                    inputType="password"
                    type="password"
                    name="basicAuthPassword"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostPassword.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostPassword.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ null }
                    readOnly={ readOnly }
                    width={ 12 }
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-password` }
                />
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostPassword.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics HTTP Connection Timeout"
                    inputType="number"
                    min={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    name="httpConnectionTimeout"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostConnectionTimeout.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostConnectionTimeout.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    readOnly={ readOnly }
                    width={ 12 }
                    labelPosition="right"
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-connection-timeout` }
                >
                    <input/>
                    <Label
                        content={ "miliseconds" }
                    />
                </Field.Input>
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostConnectionTimeout.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics HTTP Read Timeout"
                    inputType="number"
                    min={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    name="httpReadTimeout"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostReadTimeout.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostReadTimeout.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    readOnly={ readOnly }
                    width={ 12 }
                    labelPosition="right"
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-read-timeout` }
                >
                    <input/>
                    <Label
                        content={ "miliseconds" }
                    />
                </Field.Input>
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostReadTimeout.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics HTTP Connection Request Timeout"
                    inputType="number"
                    min={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    name="httpConnectionRequestTimeout"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostConnectionRequestTimeout.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostConnectionRequestTimeout.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ GovernanceConnectorConstants.ANALYTICS_FORM_FIELD_CONSTRAINTS
                        .TIMEOUT_MIN_LENGTH }
                    readOnly={ readOnly }
                    width={ 12 }
                    labelPosition="right"
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-connection-request-timeout` }
                >
                    <input/>
                    <Label
                        content={ "miliseconds" }
                    />
                </Field.Input>
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostConnectionRequestTimeout.hint")
                    }
                </Hint>
                <Field.Input
                    ariaLabel="Analytics Host Name Verification"
                    inputType="default"
                    name="hostNameVerfier"
                    label={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostNameVerification.label") }
                    placeholder={ t("extensions:manage.serverConfigurations.analytics." +
                        "form.fields.hostNameVerification.placeholder") }
                    required={ true }
                    maxLength={ null }
                    minLength={ null }
                    readOnly={ readOnly }
                    width={ 12 }
                    disabled={ !isConnectorEnabled }
                    data-testid={ `${componentId}-host-name-verifier` }
                />
                <Hint className={ "mb-5" }>
                    {
                        t("extensions:manage.serverConfigurations.analytics." +
                            "form.fields.hostNameVerification.hint")
                    }
                </Hint>
                <Field.Button
                    form={ FORM_ID }
                    size="small"
                    buttonType="primary_btn"
                    ariaLabel="Analytics config update button"
                    name="update-button"
                    data-testid={ `${componentId}-submit-button` }
                    disabled={ isSubmitting }
                    loading={ isSubmitting }
                    label={ t("common:update") }
                    hidden={ !isConnectorEnabled || readOnly }
                />
            </Form>
        </div>
    );
};

/**
 * Default props for the component.
 */
AnalyticsConfigurationForm.defaultProps = {
    "data-componentid": "analytics-edit-form"
};
