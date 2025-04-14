import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatListScreen from '../../screens/chatscreens/chatlist/chatlistscreen'
import ChatRoomScreen from '@/app/screens/chatscreens/chatroom/chatroomscreen';

export type ChatStackParamList = {  // 👈 Add `export` here
  ChatList: undefined;
  ChatRoom: { roomId: string; roomName: string };
  NewChat: undefined;
};

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatTab() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
{/* //      <ChatStack.Screen name="NewChat" component={NewChatScreen} /> */}
    </ChatStack.Navigator>
  );
}