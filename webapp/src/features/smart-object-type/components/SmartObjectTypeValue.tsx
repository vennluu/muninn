import { SmartObjectFormConfig } from '../type';
import { normalizeFormConfigField } from '../utils/config';
import { ObjectTypeRegistryInstance as ObjectTypeRegistry } from '../utils/registry';

interface SmartObjectTypeValueProps {
  field: string;
  config: SmartObjectFormConfig['fields'][string];
  value?: any;
  onClick?: (value: any) => void;
}
export const SmartObjectTypeValue: React.FC<SmartObjectTypeValueProps> = ({
  field,
  config: rawConfig,
  value,
  onClick,
}) => {
  const config = normalizeFormConfigField(rawConfig);
  if (!config) return null;
  const typeImpl = ObjectTypeRegistry.get(config.type);
  if (!typeImpl) return null;

  return (
    <typeImpl.Display
      value={value}
      validation={config.validation}
      onClick={onClick}
    />
  );
};
