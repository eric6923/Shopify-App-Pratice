import { useState } from 'react';
import {
  Modal,
  Button,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Icon
} from '@shopify/polaris';
import { PersonIcon } from '@shopify/polaris-icons';
import { useNavigate } from '@remix-run/react';

const RewardSelectionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

  const handleChange = (value: string) => {
    setSelected(value);
  };

  const handleCreateProgram = () => {
    if (selected === 'friend') {
      navigate('/app/friend');
    } else if (selected === 'referrer') {
      navigate('/app/ref');
    }
    setIsOpen(false);
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Create a Reward
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose who gets this reward"
        primaryAction={{
          content: 'Create Program',
          onAction: handleCreateProgram,
          disabled: !selected, 
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack gap="200" align="start">
              <div className="p-2 bg-sky-50 rounded-lg">
                <Icon source={PersonIcon} />
              </div>
              <BlockStack gap="100">
                <RadioButton
                  label="Referrer"
                  checked={selected === 'referrer'}
                  id="referrer"
                  name="reward"
                  onChange={() => handleChange('referrer')}
                />
                <Text as="span" variant="bodyMd" tone="subdued">
                  Referrer earn this reward for a successful referral.
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" align="start">
              <div className="p-2 bg-sky-50 rounded-lg">
                <Icon source={PersonIcon} />
              </div>
              <BlockStack gap="100">
                <RadioButton
                  label="Friend"
                  checked={selected === 'friend'}
                  id="friend"
                  name="reward"
                  onChange={() => handleChange('friend')}
                />
                <Text as="span" variant="bodyMd" tone="subdued">
                  Friend is the referred person. You can choose to provide a reward for the friend - the referred person.
                </Text>
              </BlockStack>
            </InlineStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default RewardSelectionDialog;