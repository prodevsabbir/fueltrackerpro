import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';
import { HelplineService } from './helpline.service';
import { getIo } from '../../socket/server';
import { userModel } from '../usersAuth/user.models';

const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  let requestData = { ...req.body };

  // If user is registered, strictly enforce data from database
  if (authUser?._id) {
    const userProfile = await userModel.findById(authUser._id).lean();
    if (userProfile) {
      // Overwrite form data with verified database info
      requestData.name = userProfile.name;
      requestData.email = userProfile.email;
      requestData.phone = userProfile.phone || requestData.phone; 
      requestData.userId = authUser._id;
    }
  }

  const request = await HelplineService.createRequest(requestData);

  // Real-time notification for admins
  try {
    const io = getIo();
    io.emit('new_helpline_request', request);
  } catch (err) {
    console.error('[SOCKET] Failed to emit new_helpline_request', err);
  }

  ApiResponse.sendSuccess(res, 201, 'Help request submitted successfully', request);
});

const getAllRequests = asyncHandler(async (req: Request, res: Response) => {
  const requests = await HelplineService.getAllRequests();
  ApiResponse.sendSuccess(res, 200, 'All help requests retrieved', requests);
});

const getUserRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const requests = await HelplineService.getUserRequests(userId);
  ApiResponse.sendSuccess(res, 200, 'Your help requests retrieved', requests);
});

const updateRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await HelplineService.updateRequestStatus(id as string, req.body);
  
  // Real-time notification via Socket.io
  if (request && request.userId && (request.status === 'resolved' || request.adminReply)) {
    try {
      const io = getIo();
      io.to(request.userId.toString()).emit('helpline_resolved', {
        id: request._id,
        status: request.status,
        reply: request.adminReply,
        subject: request.subject
      });
    } catch (err) {
      console.error('[SOCKET] Failed to emit helpline_resolved', err);
    }
  }

  ApiResponse.sendSuccess(res, 200, 'Help request updated', request);
});

const deleteRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await HelplineService.deleteRequest(id as string);
  ApiResponse.sendSuccess(res, 200, 'Help request deleted permanently', null);
});

export const HelplineController = {
  createRequest,
  getAllRequests,
  getUserRequests,
  updateRequestStatus,
  deleteRequest,
};
