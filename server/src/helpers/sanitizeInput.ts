import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string | undefined | null): string => {
  if (!input) return '';

  // এটি যেকোনো ক্ষতিকর HTML বা Script ট্যাগ মুছে ফেলবে!
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // আমরা কোনো HTML ট্যাগই অ্যালাউ করবো না
    ALLOWED_ATTR: [], // কোনো অ্যাট্রিবিউট অ্যালাউ করবো না
  });
};
