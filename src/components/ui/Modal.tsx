import Button from './Button'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
}

const Modal = ({ open, title, description, onClose }: ModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        ) : null}
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Modal
