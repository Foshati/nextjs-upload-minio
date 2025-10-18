'use client'
import { useState, useEffect } from 'react'
import { UploadInput } from '@/components/ui/upload-input'
import { FilesContainer } from '@/components/FilesContainer'
import { type FileProps } from '@/lib/types'

export type fileUploadMode = "s3PresignedUrl" | "NextjsAPIEndpoint"

export type ModeSwitchMenuProps = {
  uploadMode: fileUploadMode
  handleModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

function ModeSwitchMenu({ uploadMode, handleModeChange }: ModeSwitchMenuProps) {
  return (
    <ul className="flex items-center justify-center gap-2">
      <li>
        <label htmlFor="uploadMode">Upload Mode:</label>
      </li>
      <li>
        <select
          className="rounded-md border-2 border-gray-300"
          id="uploadMode"
          value={uploadMode}
          onChange={handleModeChange}
        >
          <option value="s3PresignedUrl">S3 Presigned Url</option>
          <option value="NextjsAPIEndpoint">Next.js API Endpoint</option>
        </select>
      </li>
    </ul>
  )
}

export default function UploadBasicPage() {
  const [files, setFiles] = useState<FileProps[]>([])
  const [uploadMode, setUploadMode] = useState<fileUploadMode>('NextjsAPIEndpoint')

  const fetchFiles = async () => {
    const response = await fetch('/api/files')
    const body = (await response.json()) as FileProps[]
    setFiles(body.map((file) => ({ ...file, isDeleting: false })))
  }

  useEffect(() => {
    fetchFiles().catch(console.error)
  }, [])

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUploadMode(event.target.value as fileUploadMode)
  }

  return (
    <main className="flex min-h-screen items-center justify-center gap-5 font-mono">
      <div className="container flex flex-col gap-5 px-3">
        <ModeSwitchMenu
          uploadMode={uploadMode}
          handleModeChange={handleModeChange}
        />
        <UploadInput onUploadSuccess={fetchFiles} />
        <FilesContainer
          files={files}
          fetchFiles={fetchFiles}
          setFiles={setFiles}
          downloadUsingPresignedUrl={false}
        />
      </div>
    </main>
  )
}
