import {
  IsSchemaTypeFromBuiltinClass,
  PathEnumOrString,
  OptionalPaths,
  RequiredPaths,
  IsPathRequired
} from 'mongoose/types/inferschematype';
import { Binary, UUID } from 'mongodb';

declare module 'mongoose' {
  export type InferRawDocTypeFromSchema<TSchema extends Schema<any>> = IsItRecordAndNotAny<ObtainSchemaGeneric<TSchema, 'EnforcedDocType'>> extends true
    ? ObtainSchemaGeneric<TSchema, 'EnforcedDocType'>
    : FlattenMaps<SubdocsToPOJOs<ObtainSchemaGeneric<TSchema, 'DocType'>>>;

  export type InferRawDocTypeWithout_id<
    SchemaDefinition,
    TSchemaOptions extends Record<any, any> = DefaultSchemaOptions,
    TTransformOptions = { bufferToBinary: false }
  > = ApplySchemaOptions<{
    [
    K in keyof (RequiredPaths<SchemaDefinition, TSchemaOptions['typeKey']> &
    OptionalPaths<SchemaDefinition, TSchemaOptions['typeKey']>)
    ]: IsPathRequired<SchemaDefinition[K], TSchemaOptions['typeKey']> extends true
      ? ObtainRawDocumentPathType<SchemaDefinition[K], TSchemaOptions['typeKey'], TTransformOptions>
      : ObtainRawDocumentPathType<SchemaDefinition[K], TSchemaOptions['typeKey'], TTransformOptions> | null;
  }, TSchemaOptions>;

  export type InferRawDocType<
    SchemaDefinition,
    TSchemaOptions extends Record<any, any> = DefaultSchemaOptions,
    TTransformOptions = { bufferToBinary: false }
  > = Require_id<InferRawDocTypeWithout_id<SchemaDefinition, TSchemaOptions, TTransformOptions>>;

  



  type RawDocTypeHint<T> = IsAny<T> extends true ? never
    : T extends { __rawDocTypeHint: infer U } ? U: never;

  





   type ObtainRawDocumentPathType<
     PathValueType,
     TypeKey extends string = DefaultTypeKey,
     TTransformOptions = { bufferToBinary: false }
   > = ResolveRawPathType<
     TypeKey extends keyof PathValueType ?
       TypeKey extends keyof PathValueType[TypeKey] ?
         PathValueType
       : PathValueType[TypeKey]
     : PathValueType,
     TypeKey extends keyof PathValueType ?
       TypeKey extends keyof PathValueType[TypeKey] ?
         {}
       : Omit<PathValueType, TypeKey>
     : {},
     TypeKey,
     TTransformOptions,
     RawDocTypeHint<PathValueType>
   >;

  type neverOrAny = ' ~neverOrAny~';

  












   type ResolveRawPathType<
       PathValueType,
       Options extends SchemaTypeOptions<PathValueType> = {},
       TypeKey extends string = DefaultSchemaOptions['typeKey'],
       TTransformOptions = { bufferToBinary: false },
       TypeHint = never
     > =
       IsNotNever<TypeHint> extends true ? TypeHint
       : [PathValueType] extends [neverOrAny] ? PathValueType
       : PathValueType extends Schema<infer RawDocType, any, any, any, any, any, any, any, any, infer TSchemaDefinition> ? IsItRecordAndNotAny<RawDocType> extends true ? RawDocType : InferRawDocType<TSchemaDefinition, DefaultSchemaOptions, TTransformOptions>
       : PathValueType extends ReadonlyArray<infer Item> ?
         IfEquals<Item, never> extends true ? any[]
         : Item extends Schema<infer RawDocType, any, any, any, any, any, any, any, any, infer TSchemaDefinition> ?
           
           Array<IsItRecordAndNotAny<RawDocType> extends true ? RawDocType : InferRawDocType<TSchemaDefinition, DefaultSchemaOptions, TTransformOptions>>
         : TypeKey extends keyof Item ?
           Item[TypeKey] extends Function | String ?
             
             
             ObtainRawDocumentPathType<Item, TypeKey, TTransformOptions>[]
           : 
             
             Array<InferRawDocType<Item, DefaultSchemaOptions, TTransformOptions>>
         : IsSchemaTypeFromBuiltinClass<Item> extends true ? ResolveRawPathType<Item, { enum: Options['enum'] }, TypeKey, TTransformOptions>[]
         : IsItRecordAndNotAny<Item> extends true ?
           Item extends Record<string, never> ?
             ObtainRawDocumentPathType<Item, TypeKey, TTransformOptions>[]
           : Array<InferRawDocType<Item, DefaultSchemaOptions, TTransformOptions>>
         : ObtainRawDocumentPathType<Item, TypeKey, TTransformOptions>[]
       : PathValueType extends StringSchemaDefinition ? PathEnumOrString<Options['enum']>
       : IfEquals<PathValueType, String> extends true ? PathEnumOrString<Options['enum']>
       : PathValueType extends NumberSchemaDefinition ?
         Options['enum'] extends ReadonlyArray<any> ?
           Options['enum'][number]
         : number
       : PathValueType extends DateSchemaDefinition ? NativeDate
       : PathValueType extends BufferSchemaDefinition ? (TTransformOptions extends { bufferToBinary: true } ? Binary : Buffer)
       : PathValueType extends BooleanSchemaDefinition ? boolean
       : PathValueType extends ObjectIdSchemaDefinition ? Types.ObjectId
       : PathValueType extends Decimal128SchemaDefinition ? Types.Decimal128
       : PathValueType extends BigintSchemaDefinition ? bigint
       : PathValueType extends UuidSchemaDefinition ? Types.UUID
       : PathValueType extends MapSchemaDefinition ? Record<string, ObtainRawDocumentPathType<Options['of'], TypeKey, TTransformOptions>>
       : PathValueType extends DoubleSchemaDefinition ? Types.Double
       : PathValueType extends UnionSchemaDefinition ?
         ResolveRawPathType<Options['of'] extends ReadonlyArray<infer Item> ? Item : never>
       : PathValueType extends ArrayConstructor ? any[]
       : PathValueType extends typeof Schema.Types.Mixed ? any
       : IfEquals<PathValueType, ObjectConstructor> extends true ? any
       : IfEquals<PathValueType, {}> extends true ? any
       : PathValueType extends typeof SchemaType ? PathValueType['prototype']
       : PathValueType extends Record<string, any> ? InferRawDocType<PathValueType>
       : unknown;
}
