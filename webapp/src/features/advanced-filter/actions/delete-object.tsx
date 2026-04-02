import { deleteObject } from 'src/api/object';
import { TableAction } from '../types/table-actions';
import { FaTrash } from 'react-icons/fa';

export const createDeleteObjectAction = (onSuccess: () => void): TableAction => ({
  id: 'delete-object',
  label: 'Delete',
  icon: <FaTrash />,
  onClick: async (selectedData: any[]) => {
    try {
      await Promise.all(selectedData.map((item) => deleteObject(item.id)));
      onSuccess();
    } catch (error) {
      console.error('Error deleting objects:', error);
      return 'Error deleting objects. Please try again.';
    }
  },
});
