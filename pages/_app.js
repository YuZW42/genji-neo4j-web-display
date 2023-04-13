import '../styles/global.css';
import React, { Suspense } from 'react'
import { Layout, Menu, Spin } from 'antd';
import { HeaderImg } from './Header';
import Link from 'next/link';
import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

export default function App({ Component, pageProps }) {

  return (
    <div className="App">
      <HeaderImg title="The Tale of Genji Poem Database" subTitle="Delta Version"/>
      <Layout
        style={{
          minHeight: "90vh"
        }}
      >
        <Header
          style={{
            position: 'relative',
            width: '100%',
            padding: '0',
            background: 'white',
          }}
        >
        <Menu
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
          }}
          mode="horizontal"
          items={[
            {
              key: 'Home',
              label: (
                <Link href={"/"} scroll={false}>Home</Link>
              )
            }, 
            // {
            //   key: 'Chapters',
            //   label: 'Chapters'
            // }, 
            {
              key: 'Poem',
              label: (
                <Link href={"/poems"} scroll={false}>Poems</Link>
              )
            }, 
            {
              key: 'Characters',
              label: (
                <Link href={"/characters"} scroll={false}>Characters</Link>
              )
            },
            // {
            //   key: 'AltChars',
            //   label: (
            //     <Link href={"/altchar"} scroll={false}>AltChar</Link>
            //   )
            // }, 
            {
              key: 'Allusions',
              label: (
                <Link href={"/allusions"} scroll={false}>Allusions</Link>
              )
            }, 
            {
              key: 'Test',
              label: (
                <Link href={"/test"} scroll={false}>Test</Link>
              )
            }, 
            {
              key: 'Edit',
              label: (
                <Link href={"/edit"} scroll={false}>Edit</Link>
              )
            }, 
            {
              key: 'About Poetry in the Tale of Genjii',
              label: (
                <Link href={"/about"} scroll={false}>About Poetry in the Tale of Genji</Link>
              )
            }, 
            {
              key: 'Acknowledgements',
              label: (
                <Link href={"/acknowledgements"} scroll={false}>Acknowledgements</Link>
              )
            }
          ]}
        />
        </Header> 
        <Content
          className="site-layout"
          style={{
            position: 'relative',
            padding: '0 50px',
            height: "calc(90vh - 134px)",
            backgroundColor: 'white', 
          }}
        >
          <Suspense fallback={<Spin />}>
            <Component {...pageProps} />
          </Suspense>
        </Content>
        {/* <Footer
          style={{
            textAlign: 'center',
          }}
        >
          J. Keith Vincent © 2022
        </Footer> */}
      </Layout>
    </div>
  )
}