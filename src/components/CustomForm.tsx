import { useRef, forwardRef, useImperativeHandle } from "react";
import type { CustomerInfo } from "../types";

export interface CustomerFormRef {
  getCustomerInfo: () => CustomerInfo;
  isValid: () => boolean;
  clear: () => void;
}

export const CustomerForm = forwardRef<CustomerFormRef>((_, ref) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const surnameRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLTextAreaElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getCustomerInfo: (): CustomerInfo => ({
      name: nameRef.current?.value?.trim() || "",
      surname: surnameRef.current?.value?.trim() || "",
      street: streetRef.current?.value?.trim() || "",
      city: cityRef.current?.value?.trim() || "",
      state: stateRef.current?.value?.trim() || "",
      zip: zipRef.current?.value?.trim() || "",
    }),
    isValid: (): boolean => {
      const info = {
        name: nameRef.current?.value?.trim() || "",
        surname: surnameRef.current?.value?.trim() || "",
        street: streetRef.current?.value?.trim() || "",
        city: cityRef.current?.value?.trim() || "",
        state: stateRef.current?.value?.trim() || "",
        zip: zipRef.current?.value?.trim() || "",
      };
      return Boolean(info.name.length && info.surname.length && info.street.length && info.city.length && info.state.length && info.zip.length);
    },
    clear: () => {
      nameRef.current!.value = "";
      surnameRef.current!.value = "";
      streetRef.current!.value = "";
      cityRef.current!.value = "";
      stateRef.current!.value = "";
      zipRef.current!.value = "";
    }
  }));

  return (
    <>
      <fieldset className="name-container">
        <legend>Customer name</legend>
        <input type="text" placeholder="Name" ref={nameRef} />
        <input type="text" placeholder="SurName" ref={surnameRef} />
      </fieldset>
      <fieldset className="address-container">
        <legend>Address</legend>
        <textarea
          placeholder="Street"
          ref={streetRef}
          className="street-input"
        />
        <input type="text" placeholder="City" ref={cityRef} />
        <input type="text" placeholder="State/province/area" ref={stateRef} />
        <input type="text" placeholder="Zip code" ref={zipRef} />
      </fieldset>
    </>
  );
});