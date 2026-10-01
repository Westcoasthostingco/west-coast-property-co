"use client";

// A <select> that posts its form as soon as a value is picked. Works without
// JavaScript too: the parent form may include a visible submit button.
export default function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => { props.onChange?.(e); e.currentTarget.form?.requestSubmit(); }} />;
}
