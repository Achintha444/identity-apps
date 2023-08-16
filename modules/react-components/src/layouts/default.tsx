/**
 * Copyright (c) 2019, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import classNames from "classnames";
import React, { FunctionComponent, PropsWithChildren, ReactElement, ReactNode } from "react";
import { Container } from "semantic-ui-react";
import { BaseLayout, BaseLayoutInterface } from "./base";

/**
 * Default layout Prop types.
 */
export interface DefaultLayoutPropsInterface extends BaseLayoutInterface {
    /**
     * App footer component.
     */
    footer?: ReactNode;
    /**
     * Extra CSS classes.
     */
    className?: string;
    /**
     * Is layout fluid.
     */
    fluid?: boolean;
    /**
     * App header component.
     */
    header?: ReactNode;
    /**
     * Content spacing.
     */
    desktopContentTopSpacing?: number;
    /**
     * height of the footer.
     */
    footerHeight: number;
    /**
     * Height of the header.
     */
    headerHeight: number;
}

/**
 * Default layout.
 *
 * @param props - Props injected to the component.
 * @returns Default Layout component.
 */
export const DefaultLayout: FunctionComponent<PropsWithChildren<DefaultLayoutPropsInterface>> = (
    props: PropsWithChildren<DefaultLayoutPropsInterface>
): ReactElement => {

    const {
        alert,
        children,
        className,
        desktopContentTopSpacing,
        footer,
        footerHeight,
        fluid,
        header,
        headerHeight,
        topLoadingBar
    } = props;

    const classes = classNames(
        "layout",
        "default-layout",
        {
            [ "fluid-default-layout" ]: fluid
        },
        className
    );

    const mainLayoutStyles = {
        paddingBottom: `${ footerHeight }px`,
        paddingTop: `${ headerHeight }px`
    };

    const mainContentStyle = {
        minHeight: `calc(100vh - ${ headerHeight + footerHeight }px`,
        paddingTop: `${ desktopContentTopSpacing }px`
    };

    return (
        <BaseLayout
            alert={ alert }
            topLoadingBar={ topLoadingBar }
        >
            <Container
                fluid={ fluid }
                className={ classes }
            >
                { header }
                <div style={ mainLayoutStyles } className="layout-content-wrapper">
                    <div style={ mainContentStyle } className="layout-content">
                        { children }
                    </div>
                </div>
                { footer }
            </Container>
        </BaseLayout>
    );
};


/**
 * Default props for the default layout.
 */
DefaultLayout.defaultProps = {
    fluid: true
};
