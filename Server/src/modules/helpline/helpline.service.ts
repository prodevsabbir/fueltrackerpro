import { IHelpline } from './helpline.interface';
import { Helpline } from './helpline.models';

const createRequest = async (payload: Partial<IHelpline>) => {
  const result = await Helpline.create(payload);
  return result;
};

const getAllRequests = async () => {
  const result = await Helpline.find().populate('userId', 'name email role').sort({ createdAt: -1 });
  return result;
};

const getRequestById = async (id: string) => {
  const result = await Helpline.findById(id).populate('userId', 'name email role');
  return result;
};

const getUserRequests = async (userId: string) => {
  const result = await Helpline.find({ userId }).sort({ createdAt: -1 });
  return result;
};

const updateRequestStatus = async (id: string, payload: Partial<IHelpline>) => {
  const result = await Helpline.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(payload.adminReply ? { repliedAt: new Date() } : {}),
    },
    { new: true }
  );
  return result;
};

const deleteRequest = async (id: string) => {
  const result = await Helpline.findByIdAndDelete(id);
  return result;
};

export const HelplineService = {
  createRequest,
  getAllRequests,
  getRequestById,
  getUserRequests,
  updateRequestStatus,
  deleteRequest,
};
