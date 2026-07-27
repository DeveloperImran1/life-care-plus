const DOMPurify = {
  // এটি একটি ফেক ফাংশন যা ইনপুট নিবে এবং সরাসরি সেটাই রিটার্ন করে দিবে
  sanitize: (input: string) => input,
  addHook: () => {},
};

export default DOMPurify;
