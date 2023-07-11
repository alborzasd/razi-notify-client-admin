export const apiUrl = process.env.REACT_APP_API_URL;


// error messages
export const errorMessages = {
    statusErrorFromServer: (statusCode) => `خطای ${statusCode} از سرور`,
    notAuthorized: 'خطای احراز هویت',
    internalServerError: 'خطای داخلی سرور.',
    networkError: 'خطای شبکه. میتواند به دلیل اتصال اینترنت شما یا تنظیمات امنیتی سرور باشد.',
    internalAppError: 'خطای داخلی برنامه. لطفا به توسعه دهنده اطلاع دهید.'
};