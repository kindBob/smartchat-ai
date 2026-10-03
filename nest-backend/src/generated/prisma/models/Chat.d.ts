import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ChatModel = runtime.Types.Result.DefaultSelection<Prisma.$ChatPayload>;
export type AggregateChat = {
    _count: ChatCountAggregateOutputType | null;
    _min: ChatMinAggregateOutputType | null;
    _max: ChatMaxAggregateOutputType | null;
};
export type ChatMinAggregateOutputType = {
    id: string | null;
    title: string | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChatMaxAggregateOutputType = {
    id: string | null;
    title: string | null;
    userId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ChatCountAggregateOutputType = {
    id: number;
    title: number;
    userId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ChatMinAggregateInputType = {
    id?: true;
    title?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChatMaxAggregateInputType = {
    id?: true;
    title?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ChatCountAggregateInputType = {
    id?: true;
    title?: true;
    userId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ChatAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatWhereInput;
    orderBy?: Prisma.ChatOrderByWithRelationInput | Prisma.ChatOrderByWithRelationInput[];
    cursor?: Prisma.ChatWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ChatCountAggregateInputType;
    _min?: ChatMinAggregateInputType;
    _max?: ChatMaxAggregateInputType;
};
export type GetChatAggregateType<T extends ChatAggregateArgs> = {
    [P in keyof T & keyof AggregateChat]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateChat[P]> : Prisma.GetScalarType<T[P], AggregateChat[P]>;
};
export type ChatGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatWhereInput;
    orderBy?: Prisma.ChatOrderByWithAggregationInput | Prisma.ChatOrderByWithAggregationInput[];
    by: Prisma.ChatScalarFieldEnum[] | Prisma.ChatScalarFieldEnum;
    having?: Prisma.ChatScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ChatCountAggregateInputType | true;
    _min?: ChatMinAggregateInputType;
    _max?: ChatMaxAggregateInputType;
};
export type ChatGroupByOutputType = {
    id: string;
    title: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ChatCountAggregateOutputType | null;
    _min: ChatMinAggregateOutputType | null;
    _max: ChatMaxAggregateOutputType | null;
};
export type GetChatGroupByPayload<T extends ChatGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ChatGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ChatGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ChatGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ChatGroupByOutputType[P]>;
}>>;
export type ChatWhereInput = {
    AND?: Prisma.ChatWhereInput | Prisma.ChatWhereInput[];
    OR?: Prisma.ChatWhereInput[];
    NOT?: Prisma.ChatWhereInput | Prisma.ChatWhereInput[];
    id?: Prisma.StringFilter<"Chat"> | string;
    title?: Prisma.StringFilter<"Chat"> | string;
    userId?: Prisma.StringFilter<"Chat"> | string;
    createdAt?: Prisma.DateTimeFilter<"Chat"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Chat"> | Date | string;
    messages?: Prisma.MessageListRelationFilter;
};
export type ChatOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    messages?: Prisma.MessageOrderByRelationAggregateInput;
};
export type ChatWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ChatWhereInput | Prisma.ChatWhereInput[];
    OR?: Prisma.ChatWhereInput[];
    NOT?: Prisma.ChatWhereInput | Prisma.ChatWhereInput[];
    title?: Prisma.StringFilter<"Chat"> | string;
    userId?: Prisma.StringFilter<"Chat"> | string;
    createdAt?: Prisma.DateTimeFilter<"Chat"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Chat"> | Date | string;
    messages?: Prisma.MessageListRelationFilter;
}, "id">;
export type ChatOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ChatCountOrderByAggregateInput;
    _max?: Prisma.ChatMaxOrderByAggregateInput;
    _min?: Prisma.ChatMinOrderByAggregateInput;
};
export type ChatScalarWhereWithAggregatesInput = {
    AND?: Prisma.ChatScalarWhereWithAggregatesInput | Prisma.ChatScalarWhereWithAggregatesInput[];
    OR?: Prisma.ChatScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ChatScalarWhereWithAggregatesInput | Prisma.ChatScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Chat"> | string;
    title?: Prisma.StringWithAggregatesFilter<"Chat"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"Chat"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Chat"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Chat"> | Date | string;
};
export type ChatCreateInput = {
    id?: string;
    title: string;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    messages?: Prisma.MessageCreateNestedManyWithoutChatInput;
};
export type ChatUncheckedCreateInput = {
    id?: string;
    title: string;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    messages?: Prisma.MessageUncheckedCreateNestedManyWithoutChatInput;
};
export type ChatUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    messages?: Prisma.MessageUpdateManyWithoutChatNestedInput;
};
export type ChatUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    messages?: Prisma.MessageUncheckedUpdateManyWithoutChatNestedInput;
};
export type ChatCreateManyInput = {
    id?: string;
    title: string;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ChatScalarRelationFilter = {
    is?: Prisma.ChatWhereInput;
    isNot?: Prisma.ChatWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type ChatCreateNestedOneWithoutMessagesInput = {
    create?: Prisma.XOR<Prisma.ChatCreateWithoutMessagesInput, Prisma.ChatUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ChatCreateOrConnectWithoutMessagesInput;
    connect?: Prisma.ChatWhereUniqueInput;
};
export type ChatUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: Prisma.XOR<Prisma.ChatCreateWithoutMessagesInput, Prisma.ChatUncheckedCreateWithoutMessagesInput>;
    connectOrCreate?: Prisma.ChatCreateOrConnectWithoutMessagesInput;
    upsert?: Prisma.ChatUpsertWithoutMessagesInput;
    connect?: Prisma.ChatWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ChatUpdateToOneWithWhereWithoutMessagesInput, Prisma.ChatUpdateWithoutMessagesInput>, Prisma.ChatUncheckedUpdateWithoutMessagesInput>;
};
export type ChatCreateWithoutMessagesInput = {
    id?: string;
    title: string;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatUncheckedCreateWithoutMessagesInput = {
    id?: string;
    title: string;
    userId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ChatCreateOrConnectWithoutMessagesInput = {
    where: Prisma.ChatWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChatCreateWithoutMessagesInput, Prisma.ChatUncheckedCreateWithoutMessagesInput>;
};
export type ChatUpsertWithoutMessagesInput = {
    update: Prisma.XOR<Prisma.ChatUpdateWithoutMessagesInput, Prisma.ChatUncheckedUpdateWithoutMessagesInput>;
    create: Prisma.XOR<Prisma.ChatCreateWithoutMessagesInput, Prisma.ChatUncheckedCreateWithoutMessagesInput>;
    where?: Prisma.ChatWhereInput;
};
export type ChatUpdateToOneWithWhereWithoutMessagesInput = {
    where?: Prisma.ChatWhereInput;
    data: Prisma.XOR<Prisma.ChatUpdateWithoutMessagesInput, Prisma.ChatUncheckedUpdateWithoutMessagesInput>;
};
export type ChatUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatUncheckedUpdateWithoutMessagesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ChatCountOutputType = {
    messages: number;
};
export type ChatCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    messages?: boolean | ChatCountOutputTypeCountMessagesArgs;
};
export type ChatCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatCountOutputTypeSelect<ExtArgs> | null;
};
export type ChatCountOutputTypeCountMessagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MessageWhereInput;
};
export type ChatSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    messages?: boolean | Prisma.Chat$messagesArgs<ExtArgs>;
    _count?: boolean | Prisma.ChatCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["chat"]>;
export type ChatSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["chat"]>;
export type ChatSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["chat"]>;
export type ChatSelectScalar = {
    id?: boolean;
    title?: boolean;
    userId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ChatOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "title" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["chat"]>;
export type ChatInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    messages?: boolean | Prisma.Chat$messagesArgs<ExtArgs>;
    _count?: boolean | Prisma.ChatCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ChatIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ChatIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ChatPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Chat";
    objects: {
        messages: Prisma.$MessagePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        title: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["chat"]>;
    composites: {};
};
export type ChatGetPayload<S extends boolean | null | undefined | ChatDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ChatPayload, S>;
export type ChatCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ChatFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ChatCountAggregateInputType | true;
};
export interface ChatDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Chat'];
        meta: {
            name: 'Chat';
        };
    };
    findUnique<T extends ChatFindUniqueArgs>(args: Prisma.SelectSubset<T, ChatFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ChatFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ChatFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ChatFindFirstArgs>(args?: Prisma.SelectSubset<T, ChatFindFirstArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ChatFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ChatFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ChatFindManyArgs>(args?: Prisma.SelectSubset<T, ChatFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ChatCreateArgs>(args: Prisma.SelectSubset<T, ChatCreateArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ChatCreateManyArgs>(args?: Prisma.SelectSubset<T, ChatCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ChatCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ChatCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ChatDeleteArgs>(args: Prisma.SelectSubset<T, ChatDeleteArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ChatUpdateArgs>(args: Prisma.SelectSubset<T, ChatUpdateArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ChatDeleteManyArgs>(args?: Prisma.SelectSubset<T, ChatDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ChatUpdateManyArgs>(args: Prisma.SelectSubset<T, ChatUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ChatUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ChatUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ChatUpsertArgs>(args: Prisma.SelectSubset<T, ChatUpsertArgs<ExtArgs>>): Prisma.Prisma__ChatClient<runtime.Types.Result.GetResult<Prisma.$ChatPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ChatCountArgs>(args?: Prisma.Subset<T, ChatCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ChatCountAggregateOutputType> : number>;
    aggregate<T extends ChatAggregateArgs>(args: Prisma.Subset<T, ChatAggregateArgs>): Prisma.PrismaPromise<GetChatAggregateType<T>>;
    groupBy<T extends ChatGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ChatGroupByArgs['orderBy'];
    } : {
        orderBy?: ChatGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ChatGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ChatFieldRefs;
}
export interface Prisma__ChatClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    messages<T extends Prisma.Chat$messagesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Chat$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ChatFieldRefs {
    readonly id: Prisma.FieldRef<"Chat", 'String'>;
    readonly title: Prisma.FieldRef<"Chat", 'String'>;
    readonly userId: Prisma.FieldRef<"Chat", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Chat", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Chat", 'DateTime'>;
}
export type ChatFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where: Prisma.ChatWhereUniqueInput;
};
export type ChatFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where: Prisma.ChatWhereUniqueInput;
};
export type ChatFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where?: Prisma.ChatWhereInput;
    orderBy?: Prisma.ChatOrderByWithRelationInput | Prisma.ChatOrderByWithRelationInput[];
    cursor?: Prisma.ChatWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatScalarFieldEnum | Prisma.ChatScalarFieldEnum[];
};
export type ChatFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where?: Prisma.ChatWhereInput;
    orderBy?: Prisma.ChatOrderByWithRelationInput | Prisma.ChatOrderByWithRelationInput[];
    cursor?: Prisma.ChatWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatScalarFieldEnum | Prisma.ChatScalarFieldEnum[];
};
export type ChatFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where?: Prisma.ChatWhereInput;
    orderBy?: Prisma.ChatOrderByWithRelationInput | Prisma.ChatOrderByWithRelationInput[];
    cursor?: Prisma.ChatWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChatScalarFieldEnum | Prisma.ChatScalarFieldEnum[];
};
export type ChatCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatCreateInput, Prisma.ChatUncheckedCreateInput>;
};
export type ChatCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ChatCreateManyInput | Prisma.ChatCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ChatCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    data: Prisma.ChatCreateManyInput | Prisma.ChatCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ChatUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatUpdateInput, Prisma.ChatUncheckedUpdateInput>;
    where: Prisma.ChatWhereUniqueInput;
};
export type ChatUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ChatUpdateManyMutationInput, Prisma.ChatUncheckedUpdateManyInput>;
    where?: Prisma.ChatWhereInput;
    limit?: number;
};
export type ChatUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ChatUpdateManyMutationInput, Prisma.ChatUncheckedUpdateManyInput>;
    where?: Prisma.ChatWhereInput;
    limit?: number;
};
export type ChatUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where: Prisma.ChatWhereUniqueInput;
    create: Prisma.XOR<Prisma.ChatCreateInput, Prisma.ChatUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ChatUpdateInput, Prisma.ChatUncheckedUpdateInput>;
};
export type ChatDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
    where: Prisma.ChatWhereUniqueInput;
};
export type ChatDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChatWhereInput;
    limit?: number;
};
export type Chat$messagesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MessageSelect<ExtArgs> | null;
    omit?: Prisma.MessageOmit<ExtArgs> | null;
    include?: Prisma.MessageInclude<ExtArgs> | null;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput | Prisma.MessageOrderByWithRelationInput[];
    cursor?: Prisma.MessageWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MessageScalarFieldEnum | Prisma.MessageScalarFieldEnum[];
};
export type ChatDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ChatSelect<ExtArgs> | null;
    omit?: Prisma.ChatOmit<ExtArgs> | null;
    include?: Prisma.ChatInclude<ExtArgs> | null;
};
