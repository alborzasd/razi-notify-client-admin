export const apiUrl = import.meta.env.VITE_API_URL;


// error messages
export const errorMessages = {
    statusErrorFromServer: (statusCode) => `خطای ${statusCode} از سرور`,
    notAuthorized: 'خطای احراز هویت',
    internalServerError: 'خطای داخلی سرور.',
    networkError: 'خطای شبکه. میتواند به دلیل اتصال اینترنت شما یا تنظیمات امنیتی سرور باشد.',
    internalAppError: 'خطای داخلی برنامه. لطفا به توسعه دهنده اطلاع دهید.'
};

export const staticFilePath = {
    departmentImage: "/static/uploads/images/departments/"
};