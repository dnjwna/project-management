import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-lg rounded-[2rem] p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}