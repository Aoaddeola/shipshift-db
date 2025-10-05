// src/users/entities/oauth-provider.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  AllowNull,
} from 'sequelize-typescript';

@Table({
  tableName: 'oauth_providers',
  timestamps: true,
})
export class OAuthProvider extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  provider: string;

  @Column(DataType.STRING)
  providerId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  accessToken: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  refreshToken: string;

  @Column(DataType.UUID)
  userId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
