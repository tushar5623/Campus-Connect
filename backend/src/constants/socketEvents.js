export const SOCKET_EVENTS = {
  // Client -> Server
  REGISTER_USER: 'register_user',
  REPORT_USER: 'report_user',
  FIND_MATCH: 'find_match',
  CANCEL_SEARCH: 'cancel_search',
  FIND_VIDEO_MATCH: 'find_video_match',
  VIDEO_OFFER: 'video_offer',
  VIDEO_ANSWER: 'video_answer',
  VIDEO_ICE_CANDIDATE: 'video_ice_candidate',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  LEAVE_CHAT: 'leave_chat',

  // Server -> Client
  LIVE_USER_COUNT: 'live_user_count',
  YOU_ARE_BLOCKED: 'you_are_blocked',
  WAITING: 'waiting',
  VIDEO_WAITING: 'video_waiting',
  MATCHED: 'matched',
  VIDEO_MATCHED: 'video_matched',
  RECEIVE_MESSAGE: 'receive_message',
  STRANGER_TYPING: 'stranger_typing',
  STRANGER_STOPPED: 'stranger_stopped',
  PARTNER_LEFT: 'partner_left',
};
