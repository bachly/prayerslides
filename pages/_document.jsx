

import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ThemeProvider } from "@/components/theme-provider"

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head />
                <body className="">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Main />
                    </ThemeProvider>
                    <NextScript />
                </body>
            </Html>
        )
    }
}