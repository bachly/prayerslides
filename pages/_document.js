

import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
    render() {
        return (
            <Html className="bg-neutral-900" lang="en">
                <Head />
                <body className="">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}