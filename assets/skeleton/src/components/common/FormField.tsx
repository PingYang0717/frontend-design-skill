import { type ReactNode } from 'react';
import { Form, type FormItemProps } from 'antd';
import {
  type Control,
  Controller,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

/** 交給輸入元件展開的 props:React Hook Form 的 field 加上 antd 需要的 id 與 status。 */
export type FormFieldInputProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = ControllerRenderProps<
  TValues,
  TName
> & {
  id: string;
  status: 'error' | undefined;
};

type FormItemLayoutProps = Pick<FormItemProps, 'label' | 'extra' | 'tooltip'>;

interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> extends FormItemLayoutProps {
  control: Control<TValues>;
  name: TName;
  /** 驗證規則,與 React Hook Form 的 Controller 相同;訊息文字一律引用字典。 */
  rules?: ControllerProps<TValues, TName>['rules'];
  /** 輸入元件由呼叫端決定,把 field 全部展開上去:`{(field) => <Input {...field} />}`。 */
  children: (field: FormFieldInputProps<TValues, TName>) => ReactNode;
}

/** React Hook Form 與 antd 的橋:一個欄位一個 FormField,驗證訊息顯示在 Form.Item 的 help。
 *  label 以 htmlFor 對到輸入元件的 id,螢幕閱讀器與測試的 getByLabelText 都靠它(docs/conventions/forms.md)。
 *  泛型元件無法寫成 React.FC<Props>,是 components.md 第 2 節允許的例外。 */
const FormField = <TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  rules,
  label,
  extra,
  tooltip,
  children,
}: FormFieldProps<TValues, TName>) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field, fieldState }) => (
      <Form.Item
        label={label}
        htmlFor={field.name}
        required={Boolean(rules?.required)}
        validateStatus={fieldState.error ? 'error' : undefined}
        help={fieldState.error?.message}
        extra={extra}
        tooltip={tooltip}
      >
        {children({ ...field, id: field.name, status: fieldState.error ? 'error' : undefined })}
      </Form.Item>
    )}
  />
);

export default FormField;
