// Type shim for the legacy CKEditor 5 classic build.
// @ckeditor/ckeditor5-build-classic ships its own .d.ts but it is
// incompatible with the @ckeditor/ckeditor5-react v11 typings.
// Declaring the module as `any` lets us import it without TS errors.
declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export default ClassicEditor;
}
