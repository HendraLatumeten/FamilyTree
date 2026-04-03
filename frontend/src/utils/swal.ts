import Swal from 'sweetalert2';

export const MySwal = Swal.mixin({
  customClass: {
    popup: 'bg-slate-800 border border-slate-700 text-white rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold text-blue-400',
    htmlContainer: 'text-slate-300',
    confirmButton: 'px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all mx-2',
    cancelButton: 'px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all mx-2',
  },
  buttonsStyling: false,
});

export const toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1e293b', // slate-800
  color: '#fff',
});

export const showSuccess = (title: string, text?: string) => {
  return MySwal.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#60a5fa', // blue-400
  });
};

export const showError = (title: string, text?: string) => {
  return MySwal.fire({
    icon: 'error',
    title,
    text,
    iconColor: '#f87171', // red-400
  });
};

export const showConfirm = (title: string, text: string, confirmButtonText: string = 'Yes') => {
  return MySwal.fire({
    title,
    text,
    icon: 'question',
    iconColor: '#60a5fa',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
  });
};

export const showLoading = (title: string, text?: string) => {
  MySwal.fire({
    title,
    text,
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
  });
};

export const showImagePreview = (url: string, title: string) => {
  return MySwal.fire({
    title,
    imageUrl: url,
    imageAlt: title,
    showConfirmButton: false,
    showCloseButton: true,
    width: 'auto',
    padding: '1rem',
    background: '#0f172a',
  });
};

export const closeSwal = () => {
  MySwal.close();
};
