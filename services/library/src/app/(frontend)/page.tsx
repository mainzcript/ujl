import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <Image alt="UJL Logo" height={65} src="/logo-icon.png" width={65} />
        {!user && <h1>Welcome to the UJL Library.</h1>}
        {user && <h1>Welcome back, {user.email}</h1>}
        <div className="links">
          <a className="admin" href={payloadConfig.routes.admin} rel="noopener noreferrer">
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://ujl-framework.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  )
}
