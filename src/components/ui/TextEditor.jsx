import React, { useState, useRef, useEffect } from 'react'
import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'
import MediaModal from '@/views/admin/media/MediaModal'
const TextEditor = ({
  value = '',
  onChange,
  name,
  canUpdate = true,
  importCustomInsertImage = true,
}) => {
  const [content, setContent] = useState(value)
  const editorRef = useRef(null)
  const [isModalImageManagerOpen, setIsModalImageManagerOpen] = useState(false)

  useEffect(() => {
    setContent(value)
  }, [value])

  const handleChange = (editorContent) => {
    if (onChange) {
      onChange(editorContent)
    }
  }

  const handleCloseImageManagerModal = () => {
    setIsModalImageManagerOpen(false)
  }

  const handleOpenImageManagerModal = () => {
    setIsModalImageManagerOpen(true)
  }

  const insertMultiImage = (img) => {
    const imageHTML = `<img src="${img}" alt="inserted image" />`
    editorRef.current?.insertHTML(imageHTML)

    handleCloseImageManagerModal()
  }
  const getSunEditorInstance = (sunEditor) => {
    editorRef.current = sunEditor
    setTimeout(() => {
      const editorDom = editorRef.current.core.context.element.wysiwyg
      editorDom.setAttribute('contenteditable', canUpdate ? 'true' : 'false')
      const toolbar = editorRef.current.core.context.element.toolbar
      if (!toolbar) return

      if (!canUpdate) {
        toolbar.classList.add('pointer-events-none')
      }

      const imageBtn = toolbar.querySelector(
        'button[data-command="image"][aria-label="Image"]',
      )

      if (imageBtn) {
        imageBtn.onclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
          handleOpenImageManagerModal()
        }
      }
    }, 200)
  }

  const buttonList = [
    ['undo', 'redo'],
    ['font', 'fontSize', 'formatBlock'],
    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
    ['removeFormat'],
    '/',
    ['fontColor', 'hiliteColor'],
    ['outdent', 'indent'],
    ['align', 'horizontalRule', 'list', 'table'],
    importCustomInsertImage ? ['link', 'image', 'video'] : ['link', 'video'],
    ['fullScreen', 'showBlocks', 'codeView'],
    ['preview', 'print'],
  ]

  return (
    <div>
      <div className="editor-wrapper z-[9999]">
        <SunEditor
          getSunEditorInstance={getSunEditorInstance}
          setContents={typeof content === 'string' ? content : ''}
          onChange={handleChange}
          setOptions={{
            buttonList: buttonList,
            height: '300px',
            placeholder: 'Nhập nội dung...',
            disable: !canUpdate,
          }}
        />
      </div>

      {isModalImageManagerOpen && (
        <MediaModal
          open={isModalImageManagerOpen}
          onOpenChange={setIsModalImageManagerOpen}
          showTrigger={false}
          onSelectImage={insertMultiImage}
        />
      )}
    </div>
  )
}

export default TextEditor
